import React from 'react';
import { Link } from 'react-router-dom';

import useMgnifyCobsSearch from 'hooks/data/useMgnifyCobsSearch';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import { getSimpleTaxLineage, cleanTaxLineage } from 'utils/taxon';
import Tooltip from 'components/UI/Tooltip';

type ResultsProps = {
  sequence: string;
  threshold: number;
  cataloguesFilter: string;
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
      Header: 'Genome accession',
      accessor: 'cobs.genome',
      Cell: ({ cell }) => (
        <Link to={`/genomes/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      Header: 'Taxonomic assignment',
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
    },
    {
      Header: 'Genome length',
      accessor: 'mgnify.length',
    },
    {
      Header: 'Num. contigs',
      accessor: 'mgnify.num_contigs',
    },
    {
      Header: 'Genome completeness',
      accessor: 'mgnify.completeness',
    },
    {
      Header: 'Genome contamination',
      accessor: 'mgnify.contamination',
    },
    {
      Header: 'Geographic origin',
      accessor: 'mgnify.geographic_origin',
    },
    {
      Header: 'Num. K-mers in query',
      accessor: 'cobs.num_kmers',
    },
    {
      Header: 'Num. K-mers found in genome',
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
      <h3>COBS Results</h3>
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
