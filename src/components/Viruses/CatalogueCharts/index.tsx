import React from 'react';
import { Download } from '@/interfaces';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import {
  BarChartSpec,
  TableChartView,
} from 'components/UI/CompressedTSVTable/types';
import TaxonomySankey from 'components/Viruses/TaxonomySankey';
import KronaIframe from 'components/UI/KronaIframe';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';

export const histogram = (
  column: string,
  title: string,
  bins?: number[],
  split?: string
): BarChartSpec => ({
  title,
  subtitle: 'Counts across the complete source file',
  histogramColumn: column,
  histogramBins: bins,
  histogramSplit: split,
  maxLabels: 30,
  labelsCol: { id: column, header: column, accessorFn: (row) => row[0] },
  countsCol: {
    id: 'Records',
    header: 'Records',
    accessorFn: (row) => Number(row[1]),
  },
});

export const amrChartViews: TableChartView[] = [
  {
    id: 'amr-classes',
    label: 'AMR classes',
    barChartSpec: histogram('drug_class', 'AMR classes', undefined, ';'),
  },
  {
    id: 'amr-elements',
    label: 'AMR elements',
    barChartSpec: histogram('gene_symbol', 'AMR elements'),
  },
];

type Panel = {
  title: string;
  suffix: string;
  group: string;
  spec?: BarChartSpec;
  sankey?: {
    lineageColumn?: string;
    delimiter?: string;
    representativeSourcesOnly?: boolean;
    seriesName?: string;
  };
};
const panels: Panel[] = [
  {
    title: 'Sequence lengths',
    group: 'QC',
    suffix: 'viruses/viruses-all-metadata.tsv.gz',
    spec: histogram(
      'Sequence_length',
      'Sequence lengths (bp)',
      [0, 5000, 10000, 20000, 50000, 100000]
    ),
  },
  {
    title: 'Cluster sizes',
    group: 'QC',
    suffix: 'viruses/viruses-cluster-stats.tsv.gz',
    spec: histogram(
      'cluster_size',
      'Viral cluster sizes',
      [1, 2, 3, 6, 11, 51, 101]
    ),
  },
  {
    title: 'CheckV quality',
    group: 'QC',
    suffix: 'viruses/viruses-all-metadata.tsv.gz',
    spec: histogram('checkv_quality', 'CheckV quality'),
  },
  {
    title: 'Prediction methods',
    group: 'QC',
    suffix: 'viruses/viruses-all-metadata.tsv.gz',
    spec: histogram('Source_of_prediction', 'Prediction methods'),
  },
  ...amrChartViews.map((view) => ({
    title: view.label,
    group: 'AMR',
    suffix:
      'viruses/cluster_representatives/functional_annotation/amr/viruses.tsv',
    spec: view.barChartSpec,
  })),
  ...['PFAM', 'COG', 'PHROG', 'VOG', 'PVOG', 'CAZy'].map((database) => ({
    title: `${database} annotations`,
    group: 'Protein annotations',
    suffix: `viruses/cluster_representatives/functional_annotation/hmmer/${database}_summary.tsv.gz`,
    spec: {
      title: `${database} annotations`,
      subtitle: 'Annotation hits across the complete catalogue summary',
      maxLabels: 20,
      labelsCol: {
        id: 'accession',
        header: 'Accession',
        accessorFn: (row) => row[0],
      },
      countsCol: {
        id: 'Hits',
        header: 'Hits',
        accessorFn: (row) => Number(row[1]),
      },
    },
  })),
  ...['genomad', 'viphogs', 'vitap'].map((database) => ({
    title: `${
      { genomad: 'geNomad', viphogs: 'ViPhOG', vitap: 'VITAP' }[database]
    } taxonomy`,
    group: 'Taxonomy',
    sankey: {},
    suffix: `viruses/cluster_representatives/taxonomy/${database}/viruses_${database}_taxonomy_counts.tsv`,
  })),
  {
    title: 'Source genome taxonomy',
    group: 'Sources and hosts',
    suffix: 'viruses/viruses-all-metadata.tsv.gz',
    sankey: {
      lineageColumn: 'Source_lineage',
      representativeSourcesOnly: true,
      seriesName: 'Occurrences',
    },
  },
  {
    title: 'CRISPR host predictions',
    group: 'Sources and hosts',
    suffix:
      'viruses/cluster_representatives/host_detection/spacepharer/custom_chosen_host.tsv',
    sankey: { lineageColumn: 'host_lineage', seriesName: 'Predictions' },
  },
  {
    title: 'iPHoP predicted host genera',
    group: 'Sources and hosts',
    suffix:
      'viruses/cluster_representatives/host_detection/iphop/iphop_genus.csv',
    sankey: {
      lineageColumn: 'Host genus',
      delimiter: ',',
      seriesName: 'Predictions',
    },
  },
  {
    title: 'iPHoP predicted host genomes',
    group: 'Sources and hosts',
    suffix:
      'viruses/cluster_representatives/host_detection/iphop/iphop_genome.csv',
    sankey: {
      lineageColumn: 'Host taxonomy',
      delimiter: ',',
      seriesName: 'Predictions',
    },
  },
  {
    title: 'Viral lifestyle',
    group: 'Lifestyle',
    suffix:
      'viruses/cluster_representatives/functional_annotation/lifestyle/viruses.bacphlip.gz',
  },
];

const CatalogueCharts: React.FC<{
  downloads: Download[];
  section: 'qc' | 'viral-taxonomy' | 'host-taxonomy' | 'annotations';
}> = ({ downloads, section }) => {
  const available = panels
    .filter((panel) => {
      if (section === 'annotations')
        return ['AMR', 'Protein annotations', 'Lifestyle'].includes(
          panel.group
        );
      if (section === 'viral-taxonomy') return panel.group === 'Taxonomy';
      if (section === 'host-taxonomy')
        return panel.group === 'Sources and hosts';
      return panel.group === 'QC';
    })
    .flatMap((panel) => {
      const download = downloads.find((file) => file.alias === panel.suffix);
      return download ? [{ ...panel, download }] : [];
    });
  const files = [...new Set(available.map((panel) => panel.suffix))].map(
    (suffix) => {
      const views = available.filter((panel) => panel.suffix === suffix);
      return { ...views[0], views };
    }
  );
  return (
    <div className="vf-stack vf-stack--400">
      {section === 'qc' && (
        <p>
          Sequence lengths and CheckV include all source fragments. Cluster
          sizes describe representative clusters.
        </p>
      )}
      {section === 'host-taxonomy' && (
        <p>
          Source genome taxonomy includes only genome occurrences of cluster
          representatives. Predicted-host charts count prediction records.
        </p>
      )}
      <section
        role="tabpanel"
        aria-label={section}
        className="vf-stack vf-stack--400"
      >
        {files.map((file) => {
          const chartViews: TableChartView[] =
            file.views.flatMap<TableChartView>((view) => {
              const id = view.title.toLowerCase().replaceAll(' ', '-');
              if (view.sankey)
                return [
                  {
                    id,
                    label: view.title,
                    render: (data, headerRow) => (
                      <TaxonomySankey
                        data={data}
                        headerRow={headerRow}
                        title={view.title}
                        {...view.sankey}
                      />
                    ),
                  },
                ];
              return view.spec
                ? [
                    {
                      id,
                      label: view.spec.histogramBins
                        ? `${view.title} histogram`
                        : view.title,
                      barChartSpec: view.spec,
                    },
                  ]
                : [];
            });
          const countsFile = file.sankey && !file.sankey.lineageColumn;
          return (
            <div
              key={file.suffix}
              data-cy={`viral-chart-${file.title
                .toLowerCase()
                .replaceAll(' ', '-')}`}
            >
              <DetailedVisualisationCard
                title={file.download.short_description}
                ftpLink={file.download.url}
                subheading={file.download.long_description}
                showZoomButton={false}
              >
                <CompressedTSVTable
                  download={file.download}
                  delimiter={file.sankey?.delimiter}
                  columns={
                    countsFile
                      ? [
                          {
                            id: 'count',
                            header: 'Sequences',
                            accessorFn: (row) => row[0],
                          },
                          ...Array.from({ length: 8 }, (_, index) => ({
                            id: `rank-${index}`,
                            header: `Taxonomic rank ${index + 1}`,
                            accessorFn: (row: string[]) => row[index + 1],
                          })),
                        ]
                      : undefined
                  }
                  chartViews={chartViews}
                  initialView={chartViews.length ? 'chart' : 'table'}
                />
              </DetailedVisualisationCard>
            </div>
          );
        })}
        {section === 'viral-taxonomy' &&
          downloads
            .filter(
              (file) =>
                file.file_type === 'html' && file.alias.includes('_krona')
            )
            .map((file) => (
              <DetailedVisualisationCard
                key={file.alias}
                title={file.short_description}
                ftpLink={file.url}
                showZoomButton={false}
              >
                <KronaIframe url={file.url} title={file.short_description} />
              </DetailedVisualisationCard>
            ))}
      </section>
    </div>
  );
};

export default CatalogueCharts;
