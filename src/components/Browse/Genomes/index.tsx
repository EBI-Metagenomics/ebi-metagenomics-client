/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';

import CataloguesList from 'components/Browse/Genomes/CataloguesList';
import TabsForQueryParameter from 'components/UI/TabsForQueryParameter';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import GenomesTextSearch from 'components/Browse/Genomes/TextSearch';
import CobsSearch from 'components/Genomes/Cobs';
import SourmashSearch from 'components/Genomes/Sourmash';
import { MainPublicationForResource } from 'components/Publications';

const PARAMETER_NAME = 'browse-by';
const PARAMETER_DEFAULT = 'biome';
const tabs = [
  { label: 'Catalogues list', to: 'biome' },
  { label: 'All genomes', to: 'search-all' },
  { label: 'Gene search', to: 'gene-search' },
  { label: 'MAG search', to: 'mag-search' },
];

const BrowseGenomes: React.FC = () => {
  const [browseBy] = useQueryParamState(PARAMETER_NAME, PARAMETER_DEFAULT);

  return (
    <section className="mg-browse-section">
      <div className="vf-stack vf-stack--400">
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
        <MainPublicationForResource
          resource="genomes"
          citationPretext="If you use the MGnify Genomes resource, please cite:"
        />
        <div />
      </div>
      <TabsForQueryParameter
        tabs={tabs}
        queryParameter={PARAMETER_NAME}
        defaultValue={PARAMETER_DEFAULT}
      />
      <div className="vf-tabs-content">
        <div style={{ height: '1rem' }} />
        {browseBy === 'biome' && <CataloguesList />}
        {browseBy === 'search-all' && <GenomesTextSearch />}
        {browseBy === 'gene-search' && <CobsSearch />}
        {browseBy === 'mag-search' && <SourmashSearch />}
      </div>
      <hr className="vf-divider" />
    </section>
  );
};

export default BrowseGenomes;
