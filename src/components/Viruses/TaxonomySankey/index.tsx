import React, { useMemo } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import SankeyModule from 'highcharts/modules/sankey';
import { PaginatedList } from '@/interfaces';

SankeyModule(Highcharts);

type SankeyData = {
  nodes: { id: string; name: string }[];
  data: [string, string, number][];
};

type TaxonomySource = {
  lineageColumn?: string;
  representativeSourcesOnly?: boolean;
  seriesName?: string;
};

const taxonomyEdges = (
  data: PaginatedList<string[]>,
  headerRow: string[] | undefined,
  source: TaxonomySource
): SankeyData => {
  const nodes = new Map([
    [
      '[]',
      source.seriesName
        ? `All ${source.seriesName.toLowerCase()}`
        : 'All sequences',
    ],
  ]);
  const edges = new Map<string, [string, string, number]>();
  let rows: { value: string | number; ranks: string[] }[];
  if (source.lineageColumn) {
    const columnIndex = headerRow?.indexOf(source.lineageColumn) ?? -1;
    if (columnIndex < 0) throw new Error('Invalid taxonomy table');
    rows = data.items
      .filter(
        (row) =>
          !source.representativeSourcesOnly ||
          (row[headerRow!.indexOf('ID')] ===
            row[headerRow!.indexOf('Cluster_rep')] &&
            row[headerRow!.indexOf('Source')] === 'genome')
      )
      .map((row) => ({
        value: 1,
        ranks: (row[columnIndex] || 'Unclassified').split(';'),
      }));
  } else {
    rows = data.items.map(([value, ...ranks]) => ({ value, ranks }));
  }
  rows.forEach(({ value, ranks }) => {
    const count = Number(value);
    if (!Number.isFinite(count) || count < 0 || !ranks.length) {
      throw new Error('Invalid taxonomy count row');
    }
    if (count === 0) return;
    const lineage = ranks.map((name) => name.trim() || 'Unclassified');
    lineage.forEach((name, index) => {
      // Full paths keep repeated names separate under different parents.
      const parent = JSON.stringify(lineage.slice(0, index));
      const child = JSON.stringify(lineage.slice(0, index + 1));
      nodes.set(child, name);
      const key = JSON.stringify([parent, child]);
      edges.set(key, [parent, child, (edges.get(key)?.[2] ?? 0) + count]);
    });
  });
  return {
    nodes: [...nodes].map(([id, name]) => ({ id, name })),
    data: [...edges.values()],
  };
};

const TaxonomySankey: React.FC<
  {
    data: PaginatedList<string[]>;
    headerRow?: string[];
    title: string;
  } & TaxonomySource
> = ({
  data,
  headerRow,
  title,
  lineageColumn,
  representativeSourcesOnly,
  seriesName = 'Sequences',
}) => {
  const result = useMemo(() => {
    try {
      return {
        data: taxonomyEdges(data, headerRow, {
          lineageColumn,
          representativeSourcesOnly,
          seriesName: lineageColumn ? seriesName : undefined,
        }),
      };
    } catch (reason) {
      return { error: (reason as Error).message };
    }
  }, [data, headerRow, lineageColumn, representativeSourcesOnly, seriesName]);
  if (result.error) return <p role="alert">{result.error}</p>;
  if (!result.data?.data.length)
    return <p>No taxonomy counts are available.</p>;
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={{
        chart: { height: 600 },
        title: { text: title },
        credits: { enabled: false },
        series: [
          {
            type: 'sankey',
            name: seriesName,
            keys: ['from', 'to', 'weight'],
            ...result.data,
          },
        ],
      }}
    />
  );
};

export default TaxonomySankey;
