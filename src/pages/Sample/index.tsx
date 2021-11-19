import React from 'react';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseObj } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import Overview from 'components/Sample/Overview';
import AssociatedStudies from 'components/Sample/Studies';
import AssociatedRuns from 'components/Sample/Runs';
import AssociatedAssemblies from 'components/Sample/Assemblies';
import RouteForHash from 'components/Nav/RouteForHash';
import KeyValueList from 'components/UI/KeyValueList';

const tabs = [
  { label: 'Sample metadata', to: '#' },
  { label: 'Associated studies', to: '#studies' },
  { label: 'Analysed associated runs', to: '#runs' },
  { label: 'Analysed associated assemblies', to: '#assemblies' },
];

const SamplePage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`samples/${accession}`);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: sampleData } = data as MGnifyResponseObj;
  return (
    <section className="vf-content">
      <h2>Sample overview ({accession})</h2>
      <h3>Sample {sampleData.attributes['sample-name']}</h3>
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <Overview data={sampleData} />
          <Tabs tabs={tabs} />
          <section className="vf-grid">
            <div className="vf-stack vf-stack--200">
              <RouteForHash hash="" isDefault>
                <KeyValueList
                  list={
                    (sampleData?.attributes?.['sample-metadata'] as {
                      key: string;
                      value: string;
                    }[]) || []
                  }
                />
              </RouteForHash>
              <RouteForHash hash="#studies">
                <AssociatedStudies />
              </RouteForHash>
              <RouteForHash hash="#runs">
                <AssociatedRuns />
              </RouteForHash>
              <RouteForHash hash="#assemblies">
                <AssociatedAssemblies />
              </RouteForHash>
            </div>
          </section>
        </div>
      </section>
    </section>
  );
};

export default SamplePage;
