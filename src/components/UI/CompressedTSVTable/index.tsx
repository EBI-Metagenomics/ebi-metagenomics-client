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
 * Displays plain or gzip-compressed TSV files, with indexed paging for BGZF
 * downloads that provide an index.
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

export { default as TSVCell } from './TSVCell';
export default withQueryParamProvider(CompressedTSVTable);
