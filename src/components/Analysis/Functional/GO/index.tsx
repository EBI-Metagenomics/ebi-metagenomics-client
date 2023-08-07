import React, { useContext, useEffect, useState } from 'react';
import TabsForQueryParameter from 'components/UI/TabsForQueryParameter';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import useMGnifyData from 'hooks/data/useMGnifyData';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import { MGnifyDatum } from 'hooks/data/useData';
import { TAXONOMY_COLOURS } from 'utils/taxon';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import GOBar from 'src/components/VegaCharts/GOBar';
import GOBarChart from './BarChart';
import GOPieChart from './PieChart';

const tabs = [
  { label: 'Bar', to: 'bar' },
  { label: 'Pie', to: 'pie' },
];

const GO: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const [chart] = useQueryParamState('chart', 'bar');
  const { data, loading, error } = useMGnifyData(
    `analyses/${overviewData.id}/go-slim`
  );
  const [dataBundles, setDataBundles] = useState(null);
  useEffect(() => {
    if ((data?.data as MGnifyDatum[])?.length) {
      const newBundle = {
        biological_process: {
          series: [],
          categories: [],
          total: 0,
        },
        molecular_function: {
          series: [],
          categories: [],
          total: 0,
        },
        cellular_component: {
          series: [],
          categories: [],
          total: 0,
        },
      };
      (data.data as MGnifyDatum[]).forEach((term) => {
        const lineage = term?.attributes?.lineage as string;
        if (
          [
            'biological_process',
            'molecular_function',
            'cellular_component',
          ].includes(lineage)
        ) {
          newBundle[lineage].categories.push(term.attributes.description);
          newBundle[lineage].series.push(term.attributes.count);
          newBundle[lineage].total += term.attributes.count;
        }
      });
      setDataBundles(newBundle);
    }
  }, [data]);
  return (
    <div className="vf-stack">
      <h4>GO terms annotation</h4>
      <p>
        A summary of Gene Ontology (GO) terms derived from InterPro matches to
        your sample is provided in the charts below.
      </p>
      {loading && <Loading />}
      {error && <FetchError error={error} />}
      {data && (
        <>
          <h5>Switch view:</h5>
          <TabsForQueryParameter
            tabs={tabs}
            queryParameter="chart"
            defaultValue="bar"
          />
          <div className="vf-tabs-content">
            {chart === 'bar' && dataBundles && (
              <div id="go-slim-bar-charts">
                <div className="vf-grid vf-grid__col-3">
                  <GOBarChart
                    title="Biological process"
                    series={dataBundles.biological_process.series}
                    categories={dataBundles.biological_process.categories}
                    total={dataBundles.biological_process.total}
                    color={TAXONOMY_COLOURS[0]}
                    containerId="biological-process-bar-chart"
                  />
                  <GOBarChart
                    title="Molecular Function"
                    series={dataBundles.molecular_function.series}
                    categories={dataBundles.molecular_function.categories}
                    total={dataBundles.molecular_function.total}
                    color={TAXONOMY_COLOURS[3]}
                    containerId="molecular-function-bar-chart"
                  />
                  <GOBarChart
                    title="Cellular Component"
                    series={dataBundles.cellular_component.series}
                    categories={dataBundles.cellular_component.categories}
                    total={dataBundles.cellular_component.total}
                    color={TAXONOMY_COLOURS[4]}
                    containerId="cellular-component-bar-chart"
                  />
                </div>

                <h3>Vega</h3>
                <GOBar />
              </div>
            )}
            {chart === 'pie' && dataBundles && (
              <div id="go-slim-pie-charts">
                <div className="vf-grid vf-grid__col-3">
                  <GOPieChart
                    title="Biological process"
                    series={dataBundles.biological_process.series}
                    categories={dataBundles.biological_process.categories}
                    total={dataBundles.biological_process.total}
                    containerId="biological-process-pie-chart"
                  />
                  <GOPieChart
                    title="Molecular Function"
                    series={dataBundles.molecular_function.series}
                    categories={dataBundles.molecular_function.categories}
                    total={dataBundles.molecular_function.total}
                    containerId="molecular-function-pie-chart"
                  />
                  <GOPieChart
                    title="Cellular Component"
                    series={dataBundles.cellular_component.series}
                    categories={dataBundles.cellular_component.categories}
                    total={dataBundles.cellular_component.total}
                    containerId="cellular-component-pie-chart"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GO;
