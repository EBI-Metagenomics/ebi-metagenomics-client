import React from 'react';
import { Link } from 'react-router-dom';

import useMgnifyCobsSearch from 'hooks/data/useMgnifyCobsSearch';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import { getSimpleTaxLineage, cleanTaxLineage } from 'utils/taxon';
import Tooltip from 'components/UI/Tooltip';
import { getBiomeIcon } from 'utils/biomes';
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
          <p className="vf-box__text">
            {field}: {err}
          </p>
        ))}
      </div>
    );
  }
  const columns = [
    {
      id: 'biome_id',
      Header: 'Biome',
      accessor: (genome) => decodeURI(last(split(genome.mgnify.biome, '/'))),
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
      id: 'genome',
      Header: 'Accession',
      accessor: 'cobs.genome',
      Cell: ({ cell }) => (
        <Link to={`/genomes/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      id: 'catalogue',
      Header: 'Catalogue',
      accessor: (genome) => last(split(genome.mgnify.catalogue, '/')),
      Cell: ({ cell }) => (
        <Link to={`/genome-catalogues/${cell.value}`}>{cell.value}</Link>
      ),
      disableSortBy: true,
    },
    {
      Header: 'Type',
      accessor: 'mgnify.type',
      disableSortBy: true,
    },
    {
      Header: 'Taxonomy',
      accessor: 'mgnify.taxon_lineage',
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
    {
      Header: 'K-mers in query',
      accessor: 'cobs.num_kmers',
    },
    {
      Header: 'K-mers found in genome',
      accessor: 'cobs.num_kmers_found',
    },
    {
      Header: '% K-mers found',
      accessor: 'cobs.percent_kmers_found',
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
