import React from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyDatum } from 'src/hooks/data/useData';
import { TAXONOMY_COLOURS } from 'utils/taxon';
import PhylumTable from '../PhylumTable';
import PhylumPie from './Pie';

const DEPTH_TO_CLUSTER = 2;

export type TaxDatum = {
  name: string;
  i: number;
  y: number;
  lineage: string[];
  color: string;
};

/**
 * Cluster data by depth
 */
function clusterData(
  data: Array<{ attributes: Record<string, unknown> }>,
  depth = 0
): Array<TaxDatum> {
  const clusteredData: {
    [k: string]: { v: number; l: string[] };
  } = {};
  let total = 0;
  data.forEach((d) => {
    const attr = d.attributes;
    const lineage = String(attr.lineage).split(':');
    // Remove empty strings
    let category: string;
    if (lineage.length < depth) {
      category = lineage[lineage.length - 1];
    } else {
      category = lineage[depth];
    }

    if (
      depth > 0 &&
      ['', 'Bacteria', 'Eukaryota', 'other_sequences', undefined].includes(
        category
      )
    ) {
      if (lineage[0] === 'Bacteria') {
        category = 'Unassigned Bacteria';
      } else {
        category = 'Unassigned';
      }
    }
    if (lineage[0] === 'Unusigned' && lineage.length === 1) {
      category = 'Unassigned';
    }

    const val = Number(attr.count);
    total += val;
    if (category in clusteredData) {
      clusteredData[category].v += val;
    } else {
      clusteredData[category] = {
        v: val,
        l: lineage,
      };
    }
  });

  return Object.entries(clusteredData)
    .map(([name, { v, l }]) => ({
      name,
      y: v,
      lineage: l,
    }))
    .sort((a, b) => b.y - a.y)
    .map((x, i) => ({
      ...x,
      i: i + 1,
      color: TAXONOMY_COLOURS[Math.min(i, TAXONOMY_COLOURS.length - 1)],
      percentage: ((x.y * 100) / total).toFixed(2),
    }));
}

type PhylumChartsProps = {
  accession: string;
  category: string;
  chartType: string;
};
const PhylumCharts: React.FC<PhylumChartsProps> = ({
  accession,
  category,
  chartType,
}) => {
  const { data, loading, error } = useMGnifyData(
    `analyses/${accession}/taxonomy${category}`
  );

  if (loading) return <Loading />;
  if (error) return <FetchError error={error} />;
  const clusteredData = clusterData(
    data.data as MGnifyDatum[],
    DEPTH_TO_CLUSTER
  );
  const clusteredDataTop = clusterData(data.data as MGnifyDatum[]);
  const includesDomainCharts = ['', '/ssu', '/lsu'].includes(category);
  return (
    <div className="vf-stack">
      <div
        className={`vf-grid ${includesDomainCharts ? 'vf-grid__col-2' : ''}`}
      >
        {chartType === 'pie' && includesDomainCharts && (
          <PhylumPie
            clusteredData={clusteredDataTop}
            title="Domain composition"
          />
        )}
        {chartType === 'pie' && (
          <PhylumPie
            clusteredData={clusteredData}
            title="Phylum composition"
            showLegend
          />
        )}
        {chartType === 'column' && <b>column</b>}
        {chartType === 'stacked-column' && <b>stacked-column</b>}
      </div>
      <div>
        <PhylumTable clusteredData={clusteredData} />
      </div>
    </div>
  );
};

export default PhylumCharts;