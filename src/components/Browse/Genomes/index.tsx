/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList } from 'hooks/data/useData';
import { getBiomeIcon } from 'utils/biomes';
import Loading from 'components/UI/Loading';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

const BrowseGenomes: React.FC = () => {
  const [page] = useQueryParamState('page', 1, Number);
  const [order] = useQueryParamState('order', '');
  const [pageSize] = useQueryParamState('page_size', 25, Number);
  const [hasData, setHasData] = useState(false);
  const {
    data: genomesList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('genome-catalogues', {
    page,
    ordering: order,
    page_size: pageSize,
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
        className: 'mg-biome',
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

  if (!genomesList && loading) return <Loading />;
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
          initialPage={(page as number) - 1}
          sortable
          loading={loading}
          isStale={isStale}
          downloadURL={downloadURL}
        />
      )}
    </section>
  );
};

export default BrowseGenomes;
