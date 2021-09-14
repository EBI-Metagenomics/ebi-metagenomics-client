import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseObj } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import Overview from 'components/Study/Overview';

const tabs = [
  { label: 'Overview', to: '/overview' },
  { label: 'Analysis summary', to: '/analysis' },
];

const StudyPage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`studies/${accession}`, {
    include: 'publications',
  });
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const studyData = (data as MGnifyResponseObj).data;
  return (
    <section className="vf-content">
      <h2>Study {accession}</h2>
      <h3>{studyData.attributes['study-name']}</h3>
      <HashRouter>
        <Tabs tabs={tabs} />
        <section className="vf-grid">
          <div className="vf-stack vf-stack--200">
            <Switch>
              <Route path="/overview">
                <Overview data={studyData} />
              </Route>
              <Route path="/analysis">
                <div>analysis</div>
              </Route>
            </Switch>
          </div>
        </section>
      </HashRouter>
    </section>
  );
};

export default StudyPage;
