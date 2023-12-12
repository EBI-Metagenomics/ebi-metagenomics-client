import React from 'react';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseObj } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import Overview from 'components/Study/Overview';
import SummaryTab from 'components/Study/SummaryTab';
import RouteForHash from 'components/Nav/RouteForHash';
import useCanonicalAccessionRedirect from 'hooks/useCanonicalAccessionRedirect';
import Breadcrumbs from 'components/Nav/Breadcrumbs';

const tabs = [
  { label: 'Overview', to: '#overview' },
  { label: 'Analysis summary', to: '#analysis' },
];

const StudyPage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`studies/${accession}`, {
    include: 'publications',
  });
  useCanonicalAccessionRedirect(data as MGnifyResponseObj);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: studyData, included } = data as MGnifyResponseObj;
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Studies', url: '/browse/studies' },
    { label: accession },
  ];
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Study {accession}</h2>
      <h3>{studyData.attributes['study-name']}</h3>
      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <RouteForHash hash="#overview" isDefault>
            <Overview data={studyData} included={included || []} />
          </RouteForHash>
          <RouteForHash hash="#analysis">
            <SummaryTab accession={accession} />
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default StudyPage;
