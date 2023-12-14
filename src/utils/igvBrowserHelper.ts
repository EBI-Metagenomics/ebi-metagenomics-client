import { Dispatch } from 'react';
import { Browser } from 'igv';

export const updateQueryParams = (key: string, value: string) => {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set(key, value);
  const updatedUrl = currentUrl.toString();
  window.history.replaceState(null, null, updatedUrl);
};

export const resolveQueryParameters = (browser: Browser) => {
  const currentUrl = new URL(window.location.href);
  const featureId = currentUrl.searchParams.get('feature-id');
  const contigId = currentUrl.searchParams.get('contig-id');
  const selectedTrackColor = currentUrl.searchParams.get(
    'functional-annotation'
  );
  if (featureId) {
    browser.search(featureId);
  }
  if (contigId) {
    browser.search(contigId);
  }
  return {
    featureId,
    contigId,
    selectedTrackColor,
  };
};
export const handleLocusChanges = (
  browser: Browser,
  setIgvBrowser: Dispatch<object>,
  setTrackColorBys: Dispatch<object>,
  setLoading: Dispatch<boolean> = () => {
    return null;
  }
) => {
  browser.on('locuschange', (referenceFrame) => {
    const { locusSearchString, start, end } = referenceFrame[0];
    updateQueryParams('feature-id', `${locusSearchString}:${start}-${end}`);
  });
  setIgvBrowser(browser);
  setLoading(false);
  const resolvedQueryParameters = resolveQueryParameters(browser);
  if (resolvedQueryParameters.selectedTrackColor) {
    const trackColorBy = {
      label: resolvedQueryParameters.selectedTrackColor,
      value: resolvedQueryParameters.selectedTrackColor,
    };
    setTrackColorBys(trackColorBy);
  }
};
