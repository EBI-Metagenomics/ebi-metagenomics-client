/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyResponseList } from '@/hooks/data/useData';
import Loading from 'components/UI/Loading';
import useQueryParamState, { createSharedQueryParamContextForTable } from '@/hooks/queryParamState/useQueryParamState';
import { getBiomeIcon } from '@/utils/biomes';
import { cleanTaxLineage, getSimpleTaxLineage } from '@/utils/taxon';
import FetchError from 'components/UI/FetchError';
import Tooltip from 'components/UI/Tooltip';
import { SharedTextQueryParam } from 'hooks/queryParamState/QueryParamStore/QueryParamContext';

const {useGenomesPage, useGenomesageSize, useGenomesOrder, useGenomesSearch, withQueryParamProvider} = createSharedQueryParamContextForTable(
  "genomes",
  {
    genomesSearch: SharedTextQueryParam(""),
  }
)

const GenomesTextSearch: React.FC = () => {
  const [page] = useGenomesPage<number>();
  const [order] = useGenomesOrder<string>();
  const [pageSize] = useGenomesageSize<number>();
  const [search] = useGenomesSearch<string>();
  const {
    data: genomesList,
    loading,
    isStale,
    downloadURL,
    error,
  } = useMGnifyData('genomes', {
    page,
    ordering: order,
    page_size: pageSize,
    search: (search as string) || undefined,
  });

  const columns = [
    {
      id: 'biome_id',
      Header: 'Biome',
      accessor: (genome) => genome.relationships.biome.data?.id,
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
      accessor: 'id',
      Cell: ({ cell }) => (
        <Link to={`/genomes/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      id: 'catalogue',
      Header: 'Catalogue',
      accessor: (genome) => genome.relationships.catalogue.data?.id,
      Cell: ({ cell }) => (
        <Link to={`/genome-catalogues/${cell.value}`}>{cell.value}</Link>
      ),
      disableSortBy: true,
    },
    {
      Header: 'Type',
      accessor: 'attributes.type',
      disableSortBy: true,
    },
    {
      Header: 'Taxonomy',
      accessor: 'attributes.taxon-lineage',
      Cell: ({ cell }) => (
        <>
          {getSimpleTaxLineage(cell.value, true)}{' '}
          <Tooltip content={cleanTaxLineage(cell.value, ' > ')}>
            <sup>
              <span className="icon icon-common icon-info" />
            </sup>
          </Tooltip>
        </>
      ),
      disableSortBy: true,
    },
  ];

  if (loading && !isStale) return <Loading size="small" />;
  if (error || !genomesList) return <FetchError error={error} />;

  return (
    <>
      <p className="vf-text-body vf-text-body--3">
        Search for genomes across all catalogues.
      </p>
      <EMGTable
        cols={columns}
        data={genomesList as MGnifyResponseList}
        Title={`Genomes (${genomesList.meta.pagination.count})`}
        initialPage={(page as number) - 1}
        sortable
        loading={loading}
        isStale={isStale}
        showTextFilter
        downloadURL={downloadURL}
        namespace={"genomes"}
      />
    </>
  );
};

export default withQueryParamProvider(GenomesTextSearch);
