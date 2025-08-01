import axios, { AxiosError, AxiosInstance } from 'axios';
import { PaginatedList } from 'interfaces';
import { toast } from 'react-toastify';
import { map, noop, replace, snakeCase, trim, union } from 'lodash-es';
import { showSaveFilePicker } from 'native-file-system-adapter';
import Papa from 'papaparse';
import { flatten } from 'flat';

const fetchPage = async (
  endpointUrl: string,
  pageNumber = 1,
  pageParameter = 'page',
  axiosInstance: AxiosInstance = axios,
  onTooManyRequests: () => void = noop
): Promise<PaginatedList> => {
  const url = new URL(endpointUrl);
  url.searchParams.set(pageParameter, pageNumber.toString());
  const pageUrl = url.toString();
  try {
    const response = await axiosInstance.get<PaginatedList>(pageUrl);
    return response.data;
  } catch (err) {
    const axiosError = err as AxiosError;
    if (axiosError.response?.status === 429) {
      toast.warning('The API has requested that we slow down this request.');
      onTooManyRequests();
      return null;
    }
    toast.error(
      `The data cannot be fetched just now: ${axiosError.code} ${axiosError.message}`
    );
    throw err;
  }
};

const paginatedDownloader = async (
  endpointUrl: string,
  pageParameter = 'page',
  maxPages = 30,
  pageCadenceMs = 1000,
  axiosInstance: AxiosInstance = axios
) => {
  let pageNumber = 1;
  let totalItems = 0;
  let currentPageCadenceMs = pageCadenceMs;

  const throttleDown = () => {
    currentPageCadenceMs *= 1.5;
  };

  const throttle = () =>
    new Promise((r) => {
      setTimeout(r, currentPageCadenceMs);
    });

  const url = new URL(endpointUrl);
  const fileName = snakeCase(trim(replace(url.pathname, '/', ' ')));
  const fileHandle = await showSaveFilePicker({
    _preferPolyfill: false,
    suggestedName: `${fileName}.tsv`,
    types: [{ accept: { ' text/tab-separated-values': ['.tsv'] } }],
    excludeAcceptAllOption: false,
  });

  const writer = await fileHandle.createWritable();
  while (pageNumber < maxPages) {
    let hasError = false;
    /* eslint-disable no-await-in-loop */
    // Ignoring because page order potentially matters, so not using Promise.all
    const page = await fetchPage(
      endpointUrl,
      pageNumber,
      pageParameter,
      axiosInstance,
      throttleDown
    ).catch(() => {
      hasError = true;
    });
    if (hasError) {
      return null;
    }
    if (!page) {
      // 429 - too many requests
      await throttle();
      // eslint-disable-next-line no-continue
      continue;
    }
    // flatten nested JSON objects
    const flattenedItems = map(page.items, flatten);
    if (flattenedItems.length === 0) {
      return toast.warning(`No data to download for ${fileName}`);
    }
    // compute ALL columns; there may be more columns behind the first row due to nested objects
    // N.B. this is imperfect because there could also be more columns beyond the first page... these are ignored
    // since page 1 is already committed to file, we just have to carry on with those cols
    const columns = union(...flattenedItems.map((item) => Object.keys(item)));
    const tsvData = Papa.unparse(flattenedItems, {
      delimiter: '\t',
      header: pageNumber === 1,
      columns,
    });
    await writer.write(tsvData);

    totalItems += page.items.length;
    if (pageNumber === 1) {
      toast.info(`Downloaded ${totalItems} rows of ${page.count}`, {
        toastId: `${fileHandle.name}-download-progress`,
        progress: totalItems / page.count,
        autoClose: currentPageCadenceMs * 5,
      });
    } else {
      toast.update(`${fileHandle.name}-download-progress`, {
        render: `Downloaded ${totalItems} rows of ${page.count}`,
        progress: totalItems / page.count,
        autoClose: currentPageCadenceMs * 5,
      });
    }

    if (totalItems >= page.count) {
      // the next page would be 404
      break;
    }
    pageNumber += 1;
    await throttle();
  }
  await writer.close();
  toast.success(`Downloaded table to ${fileHandle.name}`);
  return null;
};

export default paginatedDownloader;
