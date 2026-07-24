import React from 'react';

import { BGZipService } from 'components/Analysis/BgZipService';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';
import IndexedBGZipTSVTable from './IndexedBGZipTSVTable';
import PlainTSVTable from './PlainTSVTable';
import type { TSVTableProps } from './types';
import './style.css';

const { usePage, withQueryParamProvider } =
  createSharedQueryParamContextForTable();

/**
 * Displays an ordinary TSV file or an indexed BGZF-compressed TSV file.
 * Can also take a plain TSV file as input, for cases where the BGZF-compression is not done.
 */
const CompressedTSVTable: React.FC<TSVTableProps> = (props) => {
  const { download } = props;
  const [pageNum, setPageNum] = usePage<number>();
  const indexUrl = BGZipService.getIndexFileUrl(download);
  const sourceKey = JSON.stringify([download.url, indexUrl]);
  const loaderProps = { ...props, pageNum, setPageNum };

  return indexUrl ? (
    <IndexedBGZipTSVTable key={sourceKey} {...loaderProps} />
  ) : (
    <PlainTSVTable key={sourceKey} {...loaderProps} />
  );
};

export default withQueryParamProvider(CompressedTSVTable);
