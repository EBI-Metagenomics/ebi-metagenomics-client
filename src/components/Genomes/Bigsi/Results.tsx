import React from 'react';
import { Link } from 'react-router-dom';

import useMgnifyBigsiSearch from 'hooks/data/useMgnifyBigsiSearch';
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
  const { data, loading, error } = useMgnifyBigsiSearch(
    sequence,
    threshold,
    cataloguesFilter
  );
  if (loading) return <Loading />;
  if (error) return <FetchError error={error} />;

  const columns = [
    {
      Header: 'Genome accession',
      accessor: 'mgnify.id',
      Cell: ({ cell }) => (
        <Link to={`/genomes/${cell.value}`}>{cell.value}</Link>
      ),
    },
    {
      Header: 'Taxonomic assignment',
      accessor: 'mgnify.attributes.taxon-lineage',
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
      accessor: 'mgnify.attributes.length',
    },
    {
      Header: 'Num. contigs',
      accessor: 'mgnify.attributes.num-contigs',
    },
    {
      Header: 'Genome completeness',
      accessor: 'mgnify.attributes.completeness',
    },
    {
      Header: 'Genome contamination',
      accessor: 'mgnify.attributes.contamination',
    },
    {
      Header: 'Geographic origin',
      accessor: 'mgnify.attributes.geographic-origin',
    },
    {
      Header: 'Num. K-mers in query',
      accessor: 'bigsi.num_kmers',
    },
    {
      Header: 'Num. K-mers found in genome',
      accessor: 'bigsi.num_kmers_found',
    },
    {
      Header: '% K-mers found',
      accessor: 'bigsi.percent_kmers_found',
    },
    {
      Header: 'BLAST score (log p)',
      accessor: (result) => ({
        score: result.bigsi.score,
        pvalue: result.bigsi.log_pvalue,
      }),
      Cell: ({ cell }) => `${cell.value.score} (${cell.value.pvalue})`,
    },
  ];
  if (!data) return null;

  return (
    <section>
      <h3>BIGSI Results</h3>
      <EMGTable
        cols={columns}
        data={data.results as Record<string, unknown>[]}
        initialPageSize={100}
        className="mg-anlyses-table"
        loading={loading}
        showPagination={false}
      />
    </section>
  );
};

export default Results;
