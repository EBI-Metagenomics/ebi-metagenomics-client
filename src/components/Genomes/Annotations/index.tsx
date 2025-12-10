import React, { useRef } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

import EMGTable from 'components/UI/EMGTable';
import { MGnifyDatum } from '@/hooks/data/useData';
import useDefaultGenomeConfig from '@/hooks/genomes/useDefaultConfig';
import { TAXONOMY_COLOURS } from '@/utils/taxon';

addExportMenu(Highcharts);

export type AnalysisItem = Record<string, unknown> & { count?: number };

type Props<T extends AnalysisItem> = {
  items?: T[];
  chartTitle: string;
  subtitleSuffix: string; // e.g. "Genome COG matches", "KEGG matches"
  tooltipEntityLabel: string; // e.g. "COG", "KEGG Class", "KEGG Module"
  tableType: string; // e.g. 'cog', 'kegg-class', 'kegg-module'
  tableTitlePrefix: string; // e.g. 'COG categories', 'KEGG classes'
  labelAccessor: (item: T) => string; // how to extract the x-axis/category label
  firstColumnHeaderOverride?: string; // optional override for first table column header
  dataCy?: string;
};

const GenomeAnnotationAnalysis = <T extends AnalysisItem>({
  items,
  chartTitle,
  subtitleSuffix,
  tooltipEntityLabel,
  tableType,
  tableTitlePrefix,
  labelAccessor,
  firstColumnHeaderOverride,
  dataCy,
}: Props<T>): JSX.Element => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const { columns, options } = useDefaultGenomeConfig();
  const filteredColumns = columns.filter(
    (column) => column.Header !== 'Pan-genome count'
  );

  if (firstColumnHeaderOverride) {
    // Mutate a copy-safe: columns comes from hook; but downstream only reads afterwards
    columns[0].Header = firstColumnHeaderOverride;
  }

  const input: T[] = Array.isArray(items) ? items : [];

  let total = 0;
  const categories: string[] = input.map((d) => String(labelAccessor(d)));
  const categoriesDescriptions: Record<string, string | undefined> = {};
  const genomeSeries: number[] = input.map((d) => {
    const c = Number(d.count || 0);
    total += c;
    return c;
  });

  options.title = {
    text: chartTitle,
  };
  options.subtitle = {
    text: `Total: ${total} ${subtitleSuffix} - Drag to zoom in/out`,
  };
  options.xAxis = {
    categories,
  };
  options.tooltip = {
    formatter() {
      const description = categoriesDescriptions[this.key as string];
      let tooltip = `${this.series.name}<br/>Count: ${this.y}`;
      if (description) {
        tooltip += `<br />${tooltipEntityLabel}: ${description}`;
      }
      return tooltip;
    },
  };
  options.series = [
    {
      name: 'Genome',
      type: 'column',
      data: genomeSeries.slice(0, 10),
      colors: TAXONOMY_COLOURS,
      stack: 'genome',
    },
  ];

  const tableData: MGnifyDatum[] = input.map(
    (d) =>
      ({
        id: String(labelAccessor(d)),
        type: tableType,
        attributes: {
          name: String(labelAccessor(d)),
          description: '',
          'genome-count': Number(d.count || 0),
          'pangenome-count': 0,
        },
      } as unknown as MGnifyDatum)
  );

  return (
    <div className="vf-stack vf-stack--200" data-cy={dataCy}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartComponentRef}
      />
      <EMGTable
        cols={filteredColumns}
        data={tableData}
        Title={`All ${tableData.length} ${tableTitlePrefix}`}
        loading={false}
        showPagination={true}
      />
    </div>
  );
};

export default GenomeAnnotationAnalysis;
