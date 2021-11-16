/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import { getBiomeIcon } from 'utils/biomes';

const BrowseSamples: React.FC = () => {
  const [queryParameters] = useQueryParametersState(
    {
      page: 1,
      order: '',
      page_size: 25,
    },
    {
      page: Number,
      page_size: Number,
    }
  );
  const [hasData, setHasData] = useState(false);
  const {
    data: genomesList,
    loading,
    isStale,
  } = useMGnifyData('genome-catalogues', {
    page: queryParameters.page as number,
    ordering: queryParameters.order as string,
    page_size: queryParameters.page_size as number,
  });

  const columns = React.useMemo(
    () => [
      {
        id: 'biome',
        Header: 'Biome',
        accessor: (catalogue) => catalogue.relationships.biome.data?.id,
        Cell: ({ cell }) => (
          <span
            className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`}
            style={{ float: 'initial' }}
          />
        ),
        disableSortBy: true,
      },
      {
        Header: 'Catalogue ID',
        accessor: 'id',
        Cell: ({ cell }) => (
          <Link to={`/genome-catalogues/${cell.value}`}>{cell.value}</Link>
        ),
      },
      {
        Header: 'Catalogue name',
        accessor: 'attributes.name',
      },
      {
        Header: 'Catalogue version',
        accessor: 'attributes.version',
      },
      {
        Header: 'Genomes count',
        accessor: 'attributes.genome-count',
      },
      {
        id: 'last_update',
        Header: 'Last Updated',
        accessor: 'attributes.last-update',
        Cell: ({ cell }) => new Date(cell.value).toLocaleDateString(),
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!genomesList);
  }, [genomesList]);

  return (
    <section className="mg-browse-section">
      <div>
        <p>
          Genome catalogues are biome-specific collections of
          metagenomic-assembled and isolate genomes. The latest version of each
          catalogue is shown on this website. Data for current and previous
          versions are available on the{' '}
          <a href="https://ftp.ebi.ac.uk/pub/databases/metagenomics/mgnify_genomes/">
            FTP server
          </a>
          .
        </p>
        <p>Select a catalogue in the table to browse or search its genomes.</p>
      </div>
      <div style={{ height: '2rem' }} />
      {hasData && (
        <EMGTable
          cols={columns}
          data={genomesList as MGnifyResponseList}
          initialPage={(queryParameters.page as number) - 1}
          sortable
          loading={loading}
          isStale={isStale}
        />
      )}
    </section>
  );
};

export default BrowseSamples;
