import React from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import useApiData from 'hooks/data/useApiData';
import { PaginatedList } from '@/interfaces';
import Loading from 'components/UI/Loading';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import { getBiomeIcon } from 'utils/biomes';
import FetchError from 'components/UI/FetchError';
import config from 'utils/config.ts';

const GenomesTextSearch: React.FC = () => {
  const [page] = useQueryParamState('page', 1, Number);
  const [order] = useQueryParamState('order', '');
  const [pageSize] = useQueryParamState('page_size', 25, Number);
  const [search] = useQueryParamState('search', '');
  const buildURL = () => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (pageSize) params.set('page_size', String(pageSize));
    if (order) params.set('ordering', String(order));
    if (search) params.set('search', String(search));
    const qs = params.toString();
    return `${config.api_v2}/genomes/${qs ? `?${qs}` : ''}`;
  };
  const {
    data: genomesList,
    loading,
    stale: isStale,
    error,
  } = useApiData<PaginatedList<any>>({
    url: buildURL(),
  });

  const columns = [
    {
      id: 'biome_id',
      Header: 'Biome',
      accessor: (genome) => genome?.biome?.lineage,
      Cell: ({ cell }) => (
        <span
          className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`}
          style={{ float: 'initial' }}
        />
      ),
      disableSortBy: true,
      className: 'mg-biome',
    },
    {
      id: 'accession',
      Header: 'Accession',
      accessor: 'accession',
      Cell: ({ cell }) => (
        <Link to={`/genomes/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      id: 'catalogue',
      Header: 'Catalogue',
      accessor: 'catalogue_id',
      Cell: ({ cell }) => (
        <Link to={`/genome-catalogues/${cell.value}`}>{cell.value}</Link>
      ),
      disableSortBy: true,
    },
    {
      Header: 'Type',
      accessor: 'type',
      disableSortBy: true,
    },
    // {
    //   Header: 'Taxonomy',
    //   accessor: (genome) => genome?.biome?.lineage,
    //   Cell: ({ cell }) => (
    //     <>
    //       {getSimpleTaxLineage(cell.value, true)}{' '}
    //       <Tooltip content={cleanTaxLineage(cell.value, ' > ')}>
    //         <sup>
    //           <span className="icon icon-common icon-info" />
    //         </sup>
    //       </Tooltip>
    //     </>
    //   ),
    //   disableSortBy: true,
    // },
  ];

  const handleDownloadCsv = () => {
    if (!genomesList?.items?.length) return;

    const headers = ['Biome', 'Accession', 'Catalogue', 'Type'];

    const escapeCSV = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const rows = (genomesList.items as any[]).map((genome) => [
      genome?.biome?.lineage ?? '',
      genome?.accession ?? '',
      genome?.catalogue_id ?? '',
      genome?.type ?? '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const ts = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `genomes-${ts}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && !isStale) return <Loading size="small" />;
  if (error || !genomesList) return <FetchError error={error} />;

  return (
    <div>
      <p className="vf-text-body vf-text-body--3">
        Search for genomes across all catalogues.
      </p>
      <EMGTable
        cols={columns}
        data={genomesList as PaginatedList}
        Title={`Genomes (${genomesList.count})`}
        initialPage={(page as number) - 1}
        expectedPageSize={pageSize as number}
        sortable
        loading={loading}
        isStale={isStale}
        showTextFilter
        onDownloadRequested={handleDownloadCsv}
      />
    </div>
  );
};

export default GenomesTextSearch;
