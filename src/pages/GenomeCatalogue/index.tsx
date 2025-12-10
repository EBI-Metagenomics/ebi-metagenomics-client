import React, { useContext } from 'react';
import ReactMarkdown from 'react-markdown';

import useApiData from '@/hooks/data/useApiData';
import useURLAccession from '@/hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import GenomesTable from 'components/Genomes/Table';
import PhyloTree from 'components/Genomes/PhyloTree';
import CobsSearch from 'components/Genomes/Cobs';
import SourmashSearch from 'components/Genomes/Sourmash';
import RouteForHash from 'components/Nav/RouteForHash';
import ArrowForLink from 'components/UI/ArrowForLink';
import UserContext from 'pages/Login/UserContext';
import ExtLink from 'components/UI/ExtLink';
import Breadcrumbs from 'components/Nav/Breadcrumbs';

const tabs = [
  { label: 'Genome list', to: '#' },
  // TODO: put back when phylo tree json downloads is made available
  // { label: 'Taxonomy tree', to: '#phylo-tab' },
  // TODO: put back when protein catalogue info is made available
  // { label: 'Protein catalogue', to: '#protein-catalog-tab' },
  { label: 'Search by Gene', to: '#genome-search-tab' },
  { label: 'Search by MAG', to: '#genome-search-mag-tab' },
];

const GenomePage: React.FC = () => {
  const accession = useURLAccession();
  const { config } = useContext(UserContext);
  interface GenomeCatalogueResponse {
    catalogue_id: string;
    version: string;
    name: string;
    description: string;
    protein_catalogue_name: string | null;
    protein_catalogue_description: string | null;
    updated_at: string;
    result_directory: string | null;
    genome_count: number;
    unclustered_genome_count: number | null;
    ftp_url: string;
    pipeline_version_tag: string;
    catalogue_biome_label: string;
    catalogue_type: string;
    other_stats: unknown;
    biome: {
      biome_name: string;
      lineage: string;
    };
  }
  const { data, loading, error } = useApiData<GenomeCatalogueResponse>({
    url: `${config.api_v2}/genomes/catalogues/${accession}`,
  });
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const genomeData = data as GenomeCatalogueResponse;
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Genomes', url: '/browse/genomes' },
    { label: genomeData.name as string },
  ];
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>{genomeData.name}</h2>

      <section className="vf-card-container vf-card-container__col-4">
        <div className="vf-card-container__inner">
          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">
                {genomeData.unclustered_genome_count}
              </h3>
              <p className="vf-card__subheading">Total genomes</p>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">{genomeData.genome_count}</h3>
              <p className="vf-card__subheading">Species-level clusters</p>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">
                <a
                  href={
                    (genomeData.ftp_url +
                      genomeData.catalogue_id +
                      '/v' +
                      genomeData.version) as string
                  }
                >
                  FTP Site
                  <ArrowForLink />
                </a>
              </h3>
              <p className="vf-card__subheading">Download full catalogue</p>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">
                <ExtLink
                  href={`${config.magsPipelineRepo}/releases/tag/${genomeData.pipeline_version_tag}`}
                >
                  Pipeline {genomeData.pipeline_version_tag}
                </ExtLink>
              </h3>
              <p className="vf-card__subheading">View workflow & tools</p>
            </div>
          </article>
        </div>
      </section>

      <div>
        <ReactMarkdown>{genomeData.description as string}</ReactMarkdown>
      </div>

      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <RouteForHash hash="" isDefault>
            <GenomesTable />
          </RouteForHash>
          {/*<RouteForHash hash="#phylo-tab">*/}
          {/*  <PhyloTree />*/}
          {/*</RouteForHash>*/}
          <RouteForHash hash="#genome-search-tab">
            <CobsSearch
              catalogueName={genomeData.name as string}
              catalogueID={genomeData.catalogue_id}
            />
          </RouteForHash>
          <RouteForHash hash="#genome-search-mag-tab">
            <SourmashSearch
              catalogueName={genomeData.name as string}
              catalogueID={genomeData.catalogue_id}
            />
          </RouteForHash>
          <RouteForHash hash="#protein-catalog-tab">
            <h3>{genomeData.protein_catalogue_name as string}</h3>
            <ReactMarkdown>
              {(genomeData.protein_catalogue_description || '') as string}
            </ReactMarkdown>
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default GenomePage;
