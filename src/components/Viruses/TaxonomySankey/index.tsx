import React, { useMemo, useState } from 'react';
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
  source: TaxonomySource,
  focusPath?: string[]
): SankeyData => {
  const nodes = new Map([
    [
      '[]',
      focusPath?.[1] ??
        (source.seriesName
          ? `All ${source.seriesName.toLowerCase()}`
          : 'All sequences'),
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
        ranks: (row[columnIndex] || 'Unclassified')
          .split(';')
          .map((name) => name.trim() || 'Unclassified'),
      }))
      .filter(
        ({ ranks }) =>
          !focusPath || focusPath.every((name, index) => ranks[index] === name)
      )
      .map(({ value, ranks }) => ({
        value,
        ranks: focusPath ? [ranks[2] || 'Unclassified'] : ranks.slice(0, 2),
      }));
    // Summarise host lineages before creating Highcharts nodes and links.
    const counts = new Map<string, number>();
    rows.forEach(({ ranks }) => {
      const key = JSON.stringify(
        ranks.map((name) => name.trim() || 'Unclassified')
      );
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const sorted = [...counts].sort(
      ([a, ac], [b, bc]) => bc - ac || a.localeCompare(b)
    );
    rows = sorted
      .slice(0, 10)
      .map(([key, value]) => ({ value, ranks: JSON.parse(key) }));
    // Keep rare taxa under their original parent, preserving parent totals.
    const others = new Map<string, number>();
    sorted.slice(10).forEach(([key, count]) => {
      const ranks: string[] = JSON.parse(key);
      const otherKey = JSON.stringify([...ranks.slice(0, -1), 'Other']);
      others.set(otherKey, (others.get(otherKey) ?? 0) + count);
    });
    others.forEach((value, key) =>
      rows.push({ value, ranks: JSON.parse(key) })
    );
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
  const [focusPath, setFocusPath] = useState<string[]>();
  const result = useMemo(() => {
    try {
      return {
        data: taxonomyEdges(
          data,
          headerRow,
          {
            lineageColumn,
            representativeSourcesOnly,
            seriesName: lineageColumn ? seriesName : undefined,
          },
          focusPath
        ),
      };
    } catch (reason) {
      return { error: (reason as Error).message };
    }
  }, [
    data,
    headerRow,
    lineageColumn,
    representativeSourcesOnly,
    seriesName,
    focusPath,
  ]);
  if (result.error) return <p role="alert">{result.error}</p>;
  if (!result.data?.data.length)
    return <p>No taxonomy counts are available.</p>;
  const subtitle = focusPath
    ? 'Top 10 classes within this phylum; remaining classes grouped as Other.'
    : 'Top 10 lineages through phylum; remaining lineages grouped as Other. Click a phylum to explore its classes.';
  return (
    <>
      {focusPath && (
        <button
          type="button"
          className="vf-button vf-button--secondary vf-button--sm"
          onClick={() => setFocusPath(undefined)}
        >
          Back to overview
        </button>
      )}
      <HighchartsReact
        highcharts={Highcharts}
        options={{
          chart: { height: 600, animation: false },
          title: { text: focusPath ? `${title}: ${focusPath[1]}` : title },
          subtitle: { text: lineageColumn ? subtitle : undefined },
          credits: { enabled: false },
          series: [
            {
              type: 'sankey',
              animation: false,
              point: {
                events: {
                  click: function (this: Highcharts.Point) {
                    if (
                      !lineageColumn ||
                      focusPath ||
                      !this.options.id ||
                      this.name === 'Other'
                    )
                      return;
                    const path: string[] = JSON.parse(this.options.id);
                    if (path.length === 2) setFocusPath(path);
                  },
                },
              },
              name: seriesName,
              keys: ['from', 'to', 'weight'],
              ...result.data,
            },
          ],
        }}
      />
    </>
  );
};

export default TaxonomySankey;
