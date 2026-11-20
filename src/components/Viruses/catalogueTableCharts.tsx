import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import BarChartForTable from 'components/Analysis/BarChartForTable';
import { TableChartView } from 'components/UI/CompressedTSVTable/types';
import TaxonomySankey from './TaxonomySankey';
import { histogram } from './CatalogueCharts';

const countBars = (
  title: string,
  values: string[],
  numericOrder = false,
  subtitle?: string
) => {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  const items = [...counts].sort(([a, ac], [b, bc]) =>
    numericOrder ? Number(a) - Number(b) : bc - ac || a.localeCompare(b)
  );
  return (
    <BarChartForTable
      data={{ items, count: items.length }}
      title={title}
      subtitle={subtitle}
      maxLabels={numericOrder ? 0 : 20}
      labelsCol={{ id: 'label', header: 'Label', accessorFn: (row) => row[0] }}
      countsCol={{ id: 'Count', header: 'Count', accessorFn: (row) => row[1] }}
    />
  );
};

const proteinFunction = (row: string[]) =>
  (row[1] ?? '').replace(/^\S+\s*/, '').trim();
const isAnnotated = (name: string) =>
  !!name && !/^(hypothetical|putative) protein$/i.test(name);
const proteinClusters = (rows: string[][]) => {
  const clusters = new Map<string, string[]>();
  rows.forEach((row) => {
    const functions = clusters.get(row[0]) ?? [];
    functions.push(proteinFunction(row));
    clusters.set(row[0], functions);
  });
  return [...clusters.values()];
};

export const proteinChartViews: TableChartView[] = [
  {
    id: 'protein-functions',
    label: 'Top protein functions',
    render: (data) =>
      countBars(
        'Top protein functions',
        data.items.map(proteinFunction).filter(isAnnotated),
        false,
        'Top 20 functions by protein count; hypothetical protein and putative protein excluded.'
      ),
  },
  {
    id: 'protein-cluster-sizes',
    label: 'Protein cluster size distribution',
    render: (data) =>
      countBars(
        'Protein cluster size distribution',
        proteinClusters(data.items).map((members) => String(members.length)),
        true,
        'Protein clusters by size (proteins per cluster).'
      ),
  },
  {
    id: 'protein-rank-abundance',
    label: 'Protein cluster rank-abundance',
    render: (data) => (
      <HighchartsReact
        highcharts={Highcharts}
        options={{
          title: { text: 'Protein cluster rank-abundance' },
          chart: { height: 450 },
          xAxis: {
            type: 'logarithmic',
            min: 1,
            title: { text: 'Protein cluster rank' },
          },
          yAxis: {
            type: 'logarithmic',
            min: 1,
            title: { text: 'Proteins per cluster' },
          },
          legend: { enabled: false },
          credits: { enabled: false },
          series: [
            {
              type: 'line',
              name: 'Proteins',
              pointStart: 1,
              data: proteinClusters(data.items)
                .map((members) => members.length)
                .sort((a, b) => b - a),
            },
          ],
        }}
      />
    ),
  },
  {
    id: 'protein-function-purity',
    label: 'Protein cluster function purity',
    render: (data) =>
      countBars(
        'Protein cluster function purity',
        proteinClusters(data.items).flatMap((members) => {
          const annotated = members.filter(isAnnotated);
          if (annotated.length < 2) return [];
          const counts = new Map<string, number>();
          annotated.forEach((name) =>
            counts.set(name, (counts.get(name) ?? 0) + 1)
          );
          return [
            String(
              Math.round(
                (100 * Math.max(...counts.values())) / annotated.length
              )
            ),
          ];
        }),
        true,
        'Percentage of annotated proteins with the main function; clusters with at least two annotated proteins.'
      ),
  },
];

export const plasmidChartViews: TableChartView[] = [
  {
    id: 'plasmid-lengths',
    label: 'Sequence lengths histogram',
    barChartSpec: histogram(
      'Sequence_length',
      'Plasmid sequence lengths (bp)',
      [0, 5000, 10000, 20000, 50000, 100000]
    ),
  },
  {
    id: 'plasmid-cluster-sizes',
    label: 'Cluster size distribution',
    render: (data, header) => {
      const representativeIndex = header?.indexOf('Cluster_rep') ?? -1;
      const idIndex = header?.indexOf('ID') ?? -1;
      const clusters = new Map<string, Set<string>>();
      data.items.forEach((row) => {
        const members =
          clusters.get(row[representativeIndex]) ?? new Set<string>();
        members.add(row[idIndex]);
        clusters.set(row[representativeIndex], members);
      });
      return countBars(
        'Plasmid cluster size distribution',
        [...clusters.values()].map((members) => String(members.size)),
        true
      );
    },
  },
  {
    id: 'plasmid-source-taxonomy',
    label: 'Source genome taxonomy',
    render: (data, headerRow) => (
      <TaxonomySankey
        data={data}
        headerRow={headerRow}
        title="Plasmid source genome taxonomy"
        lineageColumn="Source_lineage"
        seriesName="Plasmids"
      />
    ),
  },
];
