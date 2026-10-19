import React from 'react';
import { Link } from 'react-router-dom';

import useMgnifyCobsSearch from '@/hooks/data/useMgnifyCobsSearch';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import { getSimpleTaxLineage, cleanTaxLineage } from '@/utils/taxon';
import Tooltip from 'components/UI/Tooltip';
import { getBiomeIcon } from '@/utils/biomes';
import { last, split } from 'lodash-es';

type ResultsProps = {
  sequence: string;
  threshold: number;
  cataloguesFilter: string[];
};
const Results: React.FC<ResultsProps> = ({
  sequence,
  threshold,
  cataloguesFilter,
}) => {
  const { data, loading, error } = useMgnifyCobsSearch(
    sequence,
    threshold,
    cataloguesFilter
  );
  if (loading) return <Loading />;
  if (error) return <FetchError error={error} />;
  if (data?.data?.errors) {
    return (
      <div
        className="vf-box vf-box-theme--primary vf-box--easy"
        style={{
          backgroundColor: 'lemonchiffon',
        }}
      >
        <h3 className="vf-box__heading">
          <span className="icon icon-common icon-exclamation-triangle" />
          Error with your search
        </h3>
        {Object.entries(data.data.errors).map(([field, err]) => (
          <p className="vf-box__text" key={field}>
            {field}: {err}
          </p>
        ))}
      </div>
    );
  }
  const columns = [
    {
      id: 'biome_id',
      header: 'Biome',
      accessorFn: (genome) =>
        decodeURI(last(split(genome.mgnify.biome, '/')) as string),
      cell: ({ cell }) => (
        <span
          className={`biome_icon icon_xs ${getBiomeIcon(cell.getValue())}`}
          style={{ float: 'initial' }}
        />
      ),
      enableSorting: false,
      meta: { className: 'mg-biome' },
    },
    {
      id: 'genome',
      header: 'Accession',
      accessorKey: 'cobs.genome',
      cell: ({ cell }) => (
        <Link to={`/genomes/${cell.getValue()}`}>{cell.getValue()}</Link>
      ),
    },
    {
      id: 'catalogue',
      header: 'Catalogue',
      accessorFn: (genome) => last(split(genome.mgnify.catalogue, '/')),
      cell: ({ cell }) => (
        <Link to={`/genome-catalogues/${cell.getValue()}`}>
          {cell.getValue()}
        </Link>
      ),
      enableSorting: false,
    },
    {
      header: 'Type',
      accessorKey: 'mgnify.type',
      enableSorting: false,
    },
    {
      header: 'Taxonomy',
      accessorKey: 'mgnify.taxon_lineage',
      cell: ({ cell }) => (
        <>
          {getSimpleTaxLineage(cell.getValue(), true)}{' '}
          <Tooltip content={cleanTaxLineage(cell.getValue(), ' > ')}>
            <sup>
              <span className="icon icon-common icon-info" />
            </sup>
          </Tooltip>
        </>
      ),
      enableSorting: false,
    },
    {
      header: 'K-mers in query',
      accessorKey: 'cobs.num_kmers',
    },
    {
      header: 'K-mers found in genome',
      accessorKey: 'cobs.num_kmers_found',
    },
    {
      header: '% K-mers found',
      accessorKey: 'cobs.percent_kmers_found',
    },
  ];
  if (!data) return null;

  return (
    <section>
      <h5>COBS Results</h5>
      <EMGTable
        cols={columns}
        data={data.data.results as Record<string, unknown>[]}
        initialPageSize={100}
        className="mg-anlyses-table"
        loading={loading}
        showPagination={false}
      />
    </section>
  );
};

export default Results;
