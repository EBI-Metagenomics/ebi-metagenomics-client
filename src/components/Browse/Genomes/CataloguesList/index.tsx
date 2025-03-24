import React, { useEffect, useState } from 'react';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { getBiomeIcon } from 'utils/biomes';
import { Link } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import { MGnifyDatum, MGnifyResponseList } from 'hooks/data/useData';
import BiomeSelector from 'components/UI/BiomeSelector';
import { some } from 'lodash-es';

import prokaryotes from 'images/tax_icons/prokaryotes.svg';
import eukaryotes from 'images/tax_icons/eukaryotes.svg';
import viruses from 'images/tax_icons/viruses.svg';

const iconForCatalogueType = {
  prokaryotes,
  eukaryotes,
  viruses,
};

const BrowseGenomesByCatalogue: React.FC = () => {
  const [page] = useQueryParamState('page', 1, Number);
  const [order] = useQueryParamState('order', '');
  const [pageSize] = useQueryParamState('page_size', 50, Number);
  const [hasData, setHasData] = useState(false);
  const [biome] = useQueryParamState('biome', '');
  const {
    data: genomesList,
    loading,
    isStale,
    downloadURL,
  } = useMGnifyData('genome-catalogues', {
    page,
    ordering: order,
    page_size: pageSize,
    lineage: biome,
  });
  const { data: allCatalogues } = useMGnifyData('genome-catalogues', {
    page_size: 50,
  });

  const columns = React.useMemo(
    () => [
      {
        id: 'catalogue-biome-label',
        Header: 'Catalogue biome',
        accessor: 'attributes.catalogue-biome-label',
        aggregate: 'count',
        Cell: ({ cell }) => (
          <span style={{ whiteSpace: 'nowrap' }}>{cell.value}</span>
        ),
      },
      {
        id: 'biome',
        Header: '',
        accessor: (catalogue) => catalogue.relationships.biome.data?.id,
        Cell: ({ cell }) => (
          <span
            className={`biome_icon icon_xs ${getBiomeIcon(cell.value)}`}
            style={{ float: 'initial' }}
          />
        ),
        aggregate: (biomes) => biomes[0],
        className: 'mg-biome',
        disableSortBy: true,
        disableGroupBy: true,
      },
      {
        id: 'catalogue_type',
        Header: 'Type',
        accessor: 'attributes.catalogue-type',
        Cell: ({ cell }) => cell.value[0].toUpperCase() + cell.value.slice(1),
        aggregate: (catTypes) => catTypes,
        Aggregated: ({ value }) => (
          <span>
            {value.map((catType) => (
              <img
                key={catType}
                src={iconForCatalogueType[catType]}
                alt={catType}
                width="30px"
                style={{ marginRight: '8px' }}
                title={catType}
              />
            ))}
          </span>
        ),
        // catTypes.map((catType) => `${catType.slice(0, 4)}.`).join(', '),
        disableGroupBy: true,
      },
      {
        id: 'catalogue_id',
        Header: () => <span className="nowrap">Catalogue ID</span>,
        accessor: 'id',
        Cell: ({ cell }) => (
          <Link to={`/genome-catalogues/${cell.value}`}>{cell.value}</Link>
        ),
        className: 'nowrap',
        disableGroupBy: true,
      },
      {
        Header: 'Catalogue version',
        accessor: 'attributes.version',
        disableSortBy: true,
        aggregate: (versions) => versions.join(', '),
        disableGroupBy: true,
      },
      {
        Header: 'Species count',
        accessor: 'attributes.genome-count',
        aggregate: 'sum',
        disableGroupBy: true,
      },
      {
        Header: 'Total genomes count',
        accessor: 'attributes.unclustered-genome-count',
        aggregate: 'sum',
        disableGroupBy: true,
      },
      {
        id: 'last_update',
        Header: 'Last Updated',
        accessor: 'attributes.last-update',
        aggregate: 'max',
        Cell: ({ cell }) => new Date(cell.value).toLocaleDateString(),
        disableGroupBy: true,
      },
    ],
    []
  );

  useEffect(() => {
    setHasData(!!genomesList);
  }, [genomesList]);

  const isBiomeCatalogued = (lineage) => {
    if (!allCatalogues.data) return true;
    return some(allCatalogues.data, (catalogue) => {
      return (catalogue as MGnifyDatum).relationships.biome.data.id.startsWith(
        lineage
      );
    });
  };

  if (!genomesList && loading) return <Loading />;
  return (
    <section className="mg-browse-section">
      <p className="vf-text-body vf-text-body--3">
        Select a catalogue in the table to browse or search its genomes.
      </p>
      <BiomeSelector
        onSelect={async () => {
          await setHasData(false);
        }}
        lineageFilter={isBiomeCatalogued}
      />
      {hasData && (
        <EMGTable
          cols={columns}
          data={genomesList as MGnifyResponseList}
          initialPage={(page as number) - 1}
          sortable
          groupable
          initialGroup="catalogue-biome-label"
          loading={loading}
          isStale={isStale}
          downloadURL={downloadURL}
        />
      )}
    </section>
  );
};

export default BrowseGenomesByCatalogue;
