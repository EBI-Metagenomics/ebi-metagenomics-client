import React, { useRef } from 'react';
import * as Highcharts from 'highcharts';
import addExportMenu from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { ResponseFormat, TSVResponse } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';

addExportMenu(Highcharts);

const NucleotidesHistogram: React.FC = () => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(
    `analyses/${accession}/nucleotide-distribution`,
    {},
    {},
    ResponseFormat.TSV
  );

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const dataHist = { pos: [], A: [], G: [], T: [], C: [], N: [] };
  const colors = {
    A: 'rgb(16, 150, 24)',
    G: 'rgb(255, 153, 0)',
    C: 'rgb(51, 102, 204)',
    T: 'rgb(220, 57, 18)',
    N: 'rgb(138, 65, 23)',
  };
  const headers = (data as unknown as TSVResponse)[0];
  (data as unknown as TSVResponse).slice(1).forEach((line) => {
    line.forEach((v, i) => {
      dataHist[headers[i]].push(Number(v));
    });
  });

  const options = {
    chart: {
      type: 'area',
      style: {
        fontFamily: 'Helvetica',
      },
    },
    title: {
      text: 'Nucleotide position histogram',
      style: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    xAxis: {
      categories: dataHist.pos,
      tickmarkPlacement: 'on',
      title: { enabled: false },
    },
    yAxis: {
      min: 0,
      max: 100,
      title: { enabled: false },
    },
    plotOptions: {
      area: {
        stacking: 'normal',
        lineColor: '#666666',
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          lineColor: '#666666',
        },
      },
    },
    tooltip: { shared: true },
    series: ['A', 'T', 'C', 'G', 'N'].map((d) => ({
      name: d,
      data: dataHist[d],
      color: colors[d],
    })),
    credits: false,
    navigation: {
      buttonOptions: {
        height: 32,
        width: 32,
        symbolX: 16,
        symbolY: 16,
        y: -10,
      },
    },
    // exporting: util.getExportingStructure(urlToFile),
    // TODO: Add download options
  };
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
    />
  );
};

export default NucleotidesHistogram;
