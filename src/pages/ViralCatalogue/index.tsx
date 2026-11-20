import React, { useContext } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import useApiData from '@/hooks/data/useApiData';
import { ViralCatalogue } from '@/interfaces';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import ExtLink from 'components/UI/ExtLink';
import FragmentsTable from 'components/Viruses/FragmentsTable';
import CatalogueCharts from 'components/Viruses/CatalogueCharts';
import {
  proteinChartViews,
  plasmidChartViews,
} from 'components/Viruses/catalogueTableCharts';
import Downloads from 'components/Downloads/v2index';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import Tabs from 'components/UI/Tabs';
import RouteForHash from 'components/Nav/RouteForHash';
import UserContext from 'pages/Login/UserContext';
import { formatDate } from 'utils/genomes';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';

const ViralCataloguePage: React.FC = () => {
  const { catalogueId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const { config } = useContext(UserContext);
  const { data, loading, error } = useApiData<ViralCatalogue>({
    url: `${config.api_v2}viruses/catalogues/${catalogueId}`,
  });
  if (error) return <FetchError error={error} />;
  if (loading || !data) return <Loading />;
  const plasmids = data.downloads?.find(
    (file) => file.alias === 'plasmids/plasmids-all-metadata.tsv.gz'
  );
  const proteins = data.downloads?.find(
    (file) =>
      file.alias ===
      'viruses/cluster_representatives/protein_clusters_phammseqs/viruses_phams.tsv'
  );
  return (
    <section className="vf-content">
      <Breadcrumbs
        links={[
          { label: 'Home', url: '/' },
          { label: 'MGnify Viruses', url: '/browse/viruses' },
          { label: data.name },
        ]}
      />
      <h2>{data.name}</h2>
      <ReactMarkdown>{data.description}</ReactMarkdown>
      <p>
        {data.total_sequence_count ?? data.fragment_count} viral sequences
        across {data.cluster_count} representative clusters.
      </p>
      <section className="vf-card-container vf-card-container__col-4">
        <div className="vf-card-container__inner">
          {[
            [
              'Virus representatives',
              (data.virus_count ?? data.fragment_count).toLocaleString(),
              `?sequence_type=virus`,
            ],
            [
              'Prophage representatives',
              data.prophage_count?.toLocaleString() ?? 'Unknown',
              '?sequence_type=prophage',
            ],
            [
              'Plasmids',
              data.plasmid_count?.toLocaleString() ?? 'Unknown',
              '#plasmids',
            ],
            [
              'Viral clusters',
              data.cluster_count.toLocaleString(),
              '?representatives_only=true',
            ],
            ['Biome', data.biome],
            ['Version', data.version],
            ['Last updated', formatDate(data.updated_at)],
            ...(data.pipeline_version
              ? [['Pipeline', data.pipeline_version]]
              : []),
          ].map(([label, value, to]) => (
            <article
              className="vf-card vf-card--brand vf-card--bordered"
              key={label}
            >
              <div className="vf-card__content vf-stack vf-stack--200">
                <h3 className="vf-card__heading">
                  {to ? <Link to={to}>{value}</Link> : value}
                </h3>
                <p className="vf-card__subheading stat_label">{label}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Tabs
        tabs={[
          { label: 'Overview', to: '#overview' },
          { label: 'Viral fragments', to: '#' },
          { label: 'Viral taxonomy', to: '#viral-taxonomy' },
          { label: 'Host taxonomy', to: '#host-taxonomy' },
          { label: 'Protein catalogue', to: '#protein-catalogue' },
          { label: 'Plasmids', to: '#plasmids' },
          { label: 'Downloads', to: '#downloads' },
        ]}
      />
      <section className="vf-u-padding__top--400">
        <RouteForHash hash="" isDefault>
          <FragmentsTable
            key={`${searchParams.get('sequence_type')}-${searchParams.get(
              'representatives_only'
            )}`}
            catalogueId={catalogueId}
          />
        </RouteForHash>
        <RouteForHash hash="#charts">
          <Navigate
            to={{ search: searchParams.toString(), hash: '#overview' }}
            replace
          />
        </RouteForHash>
        <RouteForHash hash="#overview">
          <CatalogueCharts downloads={data.downloads ?? []} />
        </RouteForHash>
        <RouteForHash hash="#viral-taxonomy">
          <h3>Viral taxonomy</h3>
          <CatalogueCharts
            downloads={data.downloads ?? []}
            section="viral-taxonomy"
          />
        </RouteForHash>
        <RouteForHash hash="#host-taxonomy">
          <h3>Host taxonomy</h3>
          <CatalogueCharts
            downloads={data.downloads ?? []}
            section="host-taxonomy"
          />
        </RouteForHash>
        <RouteForHash hash="#protein-catalogue">
          <h3>Protein catalogue</h3>
          <p>
            Protein clusters and their member protein identifiers and
            annotations.
          </p>
          {proteins ? (
            <DetailedVisualisationCard
              title="Protein clusters"
              ftpLink={proteins.url}
              subheading={proteins.long_description}
              showZoomButton={false}
            >
              <CompressedTSVTable
                download={proteins}
                chartViews={proteinChartViews}
                columns={[
                  {
                    id: 'pham',
                    header: 'Protein cluster',
                    accessorFn: (row) => row[0],
                  },
                  {
                    id: 'protein',
                    header: 'Protein identifier and annotation',
                    accessorFn: (row) => row[1],
                  },
                ]}
              />
            </DetailedVisualisationCard>
          ) : (
            <p>No protein catalogue file is available.</p>
          )}
        </RouteForHash>
        <RouteForHash hash="#plasmids">
          <h3>Plasmids</h3>
          {plasmids ? (
            <DetailedVisualisationCard
              title={plasmids.short_description}
              ftpLink={plasmids.url}
              subheading={plasmids.long_description}
              showZoomButton={false}
            >
              <CompressedTSVTable
                download={plasmids}
                chartViews={plasmidChartViews}
              />
            </DetailedVisualisationCard>
          ) : (
            <p>No plasmid metadata file is available.</p>
          )}
        </RouteForHash>
        <RouteForHash hash="#downloads">
          <h3>Catalogue downloads</h3>
          <ExtLink href={data.ftp_url}>Catalogue FTP directory</ExtLink>
          <Downloads
            downloads={data.downloads ?? []}
            downloadName={catalogueId}
          />
        </RouteForHash>
      </section>
    </section>
  );
};

export default ViralCataloguePage;
