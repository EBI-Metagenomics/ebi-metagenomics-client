import React from 'react';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseObj } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import Overview from 'components/Sample/Overview';

const tabs = [
  { label: 'Sample metadata', to: '#metadata' },
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
  const { data: studyData } = data as MGnifyResponseObj;
  return (
    <section className="vf-content">
      <h2>Study {accession}</h2>
      <h3>{studyData.attributes['study-name']}</h3>
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <Overview data={studyData} />
          <Tabs tabs={tabs} />
        </div>
      </section>
    </section>
  );
};

export default SamplePage;
