import React, { useRef } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import EMGTable from 'components/UI/EMGTable';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyResponseList } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import useDefaultGenomeConfig from 'hooks/genomes/useDefaultConfig';
import { TAXONOMY_COLOURS } from 'utils/taxon';

addExportMenu(Highcharts);

const initialPageSize = 10;

const KEGGClassModulesAnalises: React.FC<{ includePangenomes?: boolean }> = ({
  includePangenomes = true,
}) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const accession = useURLAccession();
  const [queryParameters] = useQueryParametersState(
    {
      'keggmod-page': 1,
      'keggmod-page_size': initialPageSize,
      'keggmod-order': '',
    },
    {
      'keggmod-page': Number,
      'keggmod-page_size': Number,
    }
  );

  const { columns, options } = useDefaultGenomeConfig();
  const { data, loading, isStale, error } = useMGnifyData(
    `genomes/${accession}/kegg-module`,
    {
      page: queryParameters['keggmod-page'] as number,
      ordering: queryParameters['keggmod-order'] as string,
      page_size: queryParameters['keggmod-page_size'] as number,
    }
  );

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  let total = 0;
  const categories = (data.data as MGnifyDatum[]).map((d) =>
    String(d.attributes.name)
  );
  const categoriesDescriptions = (data.data as MGnifyDatum[]).reduce(
    (memo, d) => {
      // eslint-disable-next-line no-param-reassign
      memo[d.attributes.name as string] = d.attributes.description;
      return memo;
    },
    {}
  );
  const genomeSeries = (data.data as MGnifyDatum[]).map((d) => {
    const c = Number(d.attributes['genome-count']);
    total += c;
    return c;
  });
  const pangenomeSeries = (data.data as MGnifyDatum[]).map((d) => {
    return d.attributes['pangenome-count'];
  });

  columns[0].Header = 'Module ID';

  options.title = {
    text: 'Top 10 KEGG module categories',
  };
  options.subtitle = {
    text: `Total: ${total} KEGG module matches - Drag to zoom in/out`,
  };
  options.xAxis = {
    categories,
  };
  options.tooltip = {
    /* eslint-disable react/no-this-in-sfc */
    formatter() {
      const description = categoriesDescriptions[this.key];
      let tooltip = `${this.series.name}<br/>Count: ${this.y}`;
      if (description) {
        tooltip += `<br />KEGG Module: ${description}`;
      }
      return tooltip;
    },
    /* eslint-enable react/no-this-in-sfc */
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

  if (includePangenomes) {
    options.series.push({
      name: 'Pan-genome',
      type: 'column',
      data: pangenomeSeries.slice(0, 10),
      colors: TAXONOMY_COLOURS,
      stack: 'pangenome',
    });
  }

  return (
    <div className="vf-stack vf-stack--200">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartComponentRef}
      />
      <EMGTable
        cols={columns}
        data={data as MGnifyResponseList}
        title={`All ${data.meta.pagination.count} KEGG modules`}
        loading={loading}
        initialPage={(queryParameters['keggmod-page'] as number) - 1}
        initialPageSize={initialPageSize}
        namespace="keggmod-"
        isStale={isStale}
      />
    </div>
  );
};

export default KEGGClassModulesAnalises;
