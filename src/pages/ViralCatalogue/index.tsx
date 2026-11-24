import React, { useContext } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import useApiData from '@/hooks/data/useApiData';
import { ViralCatalogue } from '@/interfaces';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import ExtLink from 'components/UI/ExtLink';
import FragmentsTable from 'components/Viruses/FragmentsTable';
import CatalogueCharts, {
  amrChartViews,
} from 'components/Viruses/CatalogueCharts';
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
  const { pathname } = useLocation();
  const base = `/viruses/${catalogueId}`;
  const section = pathname.slice(base.length).split('/')[1] || 'overview';
  const kind = section === 'plasmids' ? 'plasmids' : 'viruses';
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
  const summaryCards = (fields: string[][]) =>
    fields.flatMap(([label, key]) => {
      const value = data.other_stats[key];
      return typeof value === 'number' ? [[label, value.toLocaleString()]] : [];
    });
  const cards: Record<string, string[][]> = {
    overview: [
      ['Biome', data.biome],
      ['Version', data.version],
      ['Last updated', formatDate(data.updated_at)],
      ...(data.pipeline_version ? [['Pipeline', data.pipeline_version]] : []),
      ...summaryCards([
        ['Total sequences', 'total_sequences'],
        ['Unique sequences', 'unique_sequences'],
        ['QC excluded sequences', 'qc_excluded_sequences'],
        ['Biomes', 'number_of_biomes'],
      ]),
    ],
    viruses: [
      [
        'Virus representatives',
        (data.virus_count ?? data.fragment_count).toLocaleString(),
        `${base}/viruses?sequence_type=virus`,
      ],
      [
        'Prophage representatives',
        data.prophage_count?.toLocaleString() ?? 'Unknown',
        `${base}/viruses?sequence_type=prophage`,
      ],
      [
        'Viral clusters',
        data.cluster_count.toLocaleString(),
        `${base}/viruses`,
      ],
      [
        'Viral sequences',
        (data.total_sequence_count ?? data.fragment_count).toLocaleString(),
      ],
      ...summaryCards([['Viral proteins', 'total_proteins_viruses']]),
    ],
    plasmids: [
      [
        'Plasmid representatives',
        data.plasmid_count?.toLocaleString() ?? 'Unknown',
        `${base}/plasmids`,
      ],
      ...summaryCards([
        ['Plasmid sequences', 'plasmids'],
        ['Plasmid proteins', 'total_proteins_plasmids'],
      ]),
    ],
  };
  return (
    <section className="vf-content">
      <Breadcrumbs
        links={[
          { label: 'Home', url: '/' },
          { label: 'MGnify Viruses', url: '/viruses' },
          { label: data.name },
        ]}
      />
      <h2>{data.name}</h2>
      <Tabs
        tabs={[
          { label: 'Overview', to: base },
          { label: 'Viruses', to: `${base}/viruses` },
          { label: 'Plasmids', to: `${base}/plasmids` },
          { label: 'Downloads', to: `${base}/downloads` },
        ]}
      />
      <section className="vf-u-padding__top--400">
        {section === 'overview' && (
          <>
            <ReactMarkdown>{data.description}</ReactMarkdown>
          </>
        )}
        {cards[section] && (
          <section className="vf-card-container vf-card-container__col-4">
            <div className="vf-card-container__inner">
              {cards[section].map(([label, value, to]) => (
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
        )}
        {['viruses', 'plasmids'].includes(section) && (
          <>
            <Tabs
              tabs={[
                { label: 'Cluster representatives', to: '#' },
                {
                  label:
                    kind === 'viruses'
                      ? 'Metadata and QC'
                      : 'Metadata and charts',
                  to: '#metadata',
                },
                ...(kind === 'viruses'
                  ? [{ label: 'Viral taxonomy', to: '#viral-taxonomy' }]
                  : []),
                { label: 'Host taxonomy', to: '#host-taxonomy' },
                { label: 'Functional annotations', to: '#annotations' },
                ...(kind === 'viruses'
                  ? [{ label: 'Protein catalogue', to: '#protein-catalogue' }]
                  : []),
              ]}
            />
            <RouteForHash hash="" isDefault>
              <FragmentsTable
                key={kind}
                catalogueId={catalogueId}
                kind={kind}
              />
            </RouteForHash>
            <RouteForHash hash="#viral-taxonomy">
              <CatalogueCharts
                downloads={data.downloads ?? []}
                section="viral-taxonomy"
              />
            </RouteForHash>
            <RouteForHash hash="#metadata">
              {kind === 'viruses' ? (
                <CatalogueCharts
                  downloads={data.downloads ?? []}
                  section="qc"
                />
              ) : (
                plasmids && (
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
                )
              )}
            </RouteForHash>
            <RouteForHash hash="#host-taxonomy">
              {kind === 'viruses' ? (
                <CatalogueCharts
                  downloads={data.downloads ?? []}
                  section="host-taxonomy"
                />
              ) : (
                plasmids && (
                  <CompressedTSVTable
                    download={plasmids}
                    chartViews={plasmidChartViews.filter(
                      (view) => view.id === 'plasmid-source-taxonomy'
                    )}
                    initialView="chart"
                  />
                )
              )}
            </RouteForHash>
            <RouteForHash hash="#annotations">
              {kind === 'viruses' ? (
                <CatalogueCharts
                  downloads={data.downloads ?? []}
                  section="annotations"
                />
              ) : (
                data.downloads
                  .filter(
                    (file) =>
                      file.alias.startsWith(
                        'plasmids/cluster_representatives/functional_annotation/'
                      ) && ['tsv', 'csv'].includes(file.file_type)
                  )
                  .map((file) => (
                    <DetailedVisualisationCard
                      key={file.alias}
                      title={file.short_description}
                      ftpLink={file.url}
                      subheading={file.long_description}
                      showZoomButton={false}
                    >
                      <CompressedTSVTable
                        download={file}
                        chartViews={
                          file.alias.endsWith('/amr/plasmids.tsv')
                            ? amrChartViews
                            : undefined
                        }
                      />
                    </DetailedVisualisationCard>
                  ))
              )}
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
          </>
        )}
        {section === 'downloads' && (
          <>
            <h3>Catalogue downloads</h3>
            <ExtLink href={data.ftp_url}>Catalogue FTP directory</ExtLink>
            <Downloads
              downloads={data.downloads ?? []}
              downloadName={catalogueId}
            />
          </>
        )}
      </section>
    </section>
  );
};

export default ViralCataloguePage;
