import React, { useContext } from 'react';
import ReactMarkdown from 'react-markdown';

import useApiData from '@/hooks/data/useApiData';
import useURLAccession from '@/hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import GenomesTable from 'components/Genomes/Table';
import CobsSearch from 'components/Genomes/Cobs';
import SourmashSearch from 'components/Genomes/Sourmash';
import RouteForHash from 'components/Nav/RouteForHash';
import ArrowForLink from 'components/UI/ArrowForLink';
import UserContext from 'pages/Login/UserContext';
import ExtLink from 'components/UI/ExtLink';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import { GenomeCatalogue } from '@/interfaces';
import PhyloTree from 'components/Genomes/PhyloTree';

const tabs = [
  { label: 'Genome list', to: '#' },
  { label: 'Taxonomy tree', to: '#phylo-tab' },
  { label: 'Protein catalogue', to: '#protein-catalog-tab' },
  { label: 'Search by Gene', to: '#genome-search-tab' },
  { label: 'Search by MAG', to: '#genome-search-mag-tab' },
];

const GenomePage: React.FC = () => {
  const accession = useURLAccession();
  const { config } = useContext(UserContext);
  const { data, loading, error } = useApiData<GenomeCatalogue>({
    url: `${config.api_v2}genomes/catalogues/${accession}`,
  });
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const {
    catalogue_id,
    description,
    ftp_url,
    genome_count,
    name,
    other_stats,
    pipeline_version_tag,
    protein_catalogue_description,
    protein_catalogue_name,
    unclustered_genome_count,
    version,
  } = data as GenomeCatalogue;
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Genomes', url: '/browse/genomes' },
    { label: name as string },
  ];
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>{name}</h2>

      <section className="vf-card-container vf-card-container__col-4">
        <div className="vf-card-container__inner">
          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">{unclustered_genome_count}</h3>
              <p className="vf-card__subheading">Total genomes</p>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">{genome_count}</h3>
              <p className="vf-card__subheading">Species-level clusters</p>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">
                {parseInt(
                  other_stats['Total proteins'] as string
                ).toLocaleString()}
              </h3>
              <p className="vf-card__subheading">Total proteins</p>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">
                {parseInt(
                  other_stats['Clusters with pan-genomes'] as string
                ).toLocaleString()}
              </h3>
              <p className="vf-card__subheading">Clusters with pan-genomes </p>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">
                {parseInt(
                  other_stats['Clusters with isolate genomes'] as string
                ).toLocaleString()}
              </h3>
              <p className="vf-card__subheading">
                Clusters with isolate genomes{' '}
              </p>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">
                <a href={(ftp_url + catalogue_id + '/v' + version) as string}>
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
                  href={`${config.magsPipelineRepo}/releases/tag/${pipeline_version_tag}`}
                >
                  Pipeline {pipeline_version_tag}
                </ExtLink>
              </h3>
              <p className="vf-card__subheading">View workflow & tools</p>
            </div>
          </article>
        </div>
      </section>

      <div>
        <ReactMarkdown>{description as string}</ReactMarkdown>
      </div>

      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <RouteForHash hash="" isDefault>
            <GenomesTable />
          </RouteForHash>
          <RouteForHash hash="#phylo-tab">
            <PhyloTree catalogueVersion={version} />
          </RouteForHash>
          <RouteForHash hash="#genome-search-tab">
            <CobsSearch
              catalogueName={name as string}
              catalogueID={catalogue_id}
            />
          </RouteForHash>
          <RouteForHash hash="#genome-search-mag-tab">
            <SourmashSearch
              catalogueName={name as string}
              catalogueID={catalogue_id}
            />
          </RouteForHash>
          <RouteForHash hash="#protein-catalog-tab">
            <h3>{protein_catalogue_name as string}</h3>
            <ReactMarkdown>
              {(protein_catalogue_description as string) ||
                'No protein catalogue description available for this catalogue.'}
            </ReactMarkdown>
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default GenomePage;
