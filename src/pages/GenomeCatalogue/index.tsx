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
import { Download, GenomeCatalogue } from '@/interfaces';
import PhyloTree from 'components/Genomes/PhyloTree';
import { formatDate } from 'utils/genomes';
import { upperFirst } from 'lodash-es';

const tabs = [
  { label: 'Genome list', to: '#' },
  { label: 'Taxonomy tree', to: '#phylo-tab' },
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
    downloads,
    updated_at,
    catalogue_type,
    version,
  } = data as GenomeCatalogue;
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Genomes', url: '/browse/genomes' },
    { label: name as string },
  ];
  const phylo_tree_url = downloads?.find(
    (file: Download) =>
      file.download_group === 'catalogue' && file.file_type === 'json'
  )?.url;
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2 className="vf-heading vf-heading--h2">{name}</h2>
      <div>
        <ReactMarkdown>{description as string}</ReactMarkdown>
      </div>

      <section className="vf-card-container vf-card-container__col-4">
        <div className="vf-card-container__inner">
          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">
                {genome_count.toLocaleString()}
              </h3>
              <p className="vf-card__subheading stat_label">
                Species representatives
              </p>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">
                {unclustered_genome_count?.toLocaleString()}
              </h3>
              <p className="vf-card__subheading stat_label">Genomes</p>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">{formatDate(updated_at)}</h3>
              <p className="vf-card__subheading stat_label">Last updated</p>
            </div>
          </article>

          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--200">
              <h3 className="vf-card__heading">{upperFirst(catalogue_type)}</h3>
              <p className="vf-card__subheading stat_label">Catalogue type</p>
            </div>
          </article>

          {[
            'Total proteins',
            'Clusters with pan-genomes',
            'Clusters with isolate genomes',
          ].map((stat) => {
            if (other_stats?.[stat] == null) return null;
            return (
              <article
                className="vf-card vf-card--brand vf-card--bordered"
                key={stat}
              >
                <div className="vf-card__content | vf-stack vf-stack--200">
                  <h3 className="vf-card__heading">
                    {parseInt(other_stats[stat] as string).toLocaleString()}
                  </h3>
                  <p className="vf-card__subheading stat_label">{stat}</p>
                </div>
              </article>
            );
          })}

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

      <section className={'vf-section mg-bordered'}>
        <h3 className={'vf-heading vf-heading--3'}>Downloads</h3>
        <div className="vf-flag vf-flag--top vf-flag--200">
          <div className="vf-flag__body">
            <h5 className="vf-card__subheading">{name} genome catalogue</h5>
            <p className={'vf-text'}>
              Species-representative genomes, MAGs, taxonomic assignments,
              functional annotations, phylogenetic trees and metadata for the
              full catalogue.
            </p>
          </div>
          <div className="vf-flag__media">
            <a
              className={'vf-link'}
              style={{ textWrap: 'nowrap' }}
              href={ftp_url}
              target="_blank"
              rel="noreferrer"
            >
              FTP site
              <ArrowForLink />
            </a>
          </div>
        </div>
        <hr className="vf-divider" />
        <div className="vf-flag vf-flag--top vf-flag--200">
          <div className="vf-flag__body">
            <h5 className="vf-card__subheading">
              {protein_catalogue_name || name + ' protein catalogue'}
            </h5>
            <ReactMarkdown
              components={{
                p: ({ ...props }) => <p {...props} className="vf-text" />,
              }}
            >
              {protein_catalogue_description as string}
            </ReactMarkdown>
          </div>
          <div className="vf-flag__media">
            <a
              className={'vf-link'}
              style={{ textWrap: 'nowrap' }}
              href={ftp_url}
              target="_blank"
              rel="noreferrer"
            >
              FTP site
              <ArrowForLink />
            </a>
          </div>
        </div>
        <hr className="vf-divider" />
        <div className="vf-flag vf-flag--top vf-flag--200">
          <div className="vf-flag__body">
            <h5 className="vf-card__subheading">README</h5>
            <p className={'vf-text'}>
              Full list of course studies and pipeline notes for this catalogue
              version.
            </p>
          </div>
          <div className="vf-flag__media">
            <a
              className={'vf-link'}
              style={{ textWrap: 'nowrap' }}
              href={ftp_url + '/README_v' + version + '.txt'}
              target="_blank"
              rel="noreferrer"
            >
              View
              <ArrowForLink />
            </a>
          </div>
        </div>
      </section>

      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <RouteForHash hash="" isDefault>
            <GenomesTable />
          </RouteForHash>
          <RouteForHash hash="#phylo-tab">
            <PhyloTree
              phylo_tree_url={phylo_tree_url}
              catalogueID={accession}
            />
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
        </div>
      </section>
    </section>
  );
};

export default GenomePage;
