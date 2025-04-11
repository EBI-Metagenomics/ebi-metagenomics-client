import React from 'react';

import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import Overview from 'components/Study/Overview';
import SummaryTab from 'components/Study/SummaryTab';
import RouteForHash from 'components/Nav/RouteForHash';
import useCanonicalAccessionRedirect from 'hooks/useCanonicalAccessionRedirect';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import useStudyDetail from 'hooks/data/useStudyDetail';
import { EnaDerivedObject } from 'interfaces';

const tabs = [
  { label: 'Overview', to: '#overview' },
  { label: 'Analysis summary', to: '#analysis' },
];

const StudyPage: React.FC = () => {
  const accession = useURLAccession();

  const { data, loading, error } = useStudyDetail(accession);

  useCanonicalAccessionRedirect(data as EnaDerivedObject);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Studies', url: '/browse/studies' },
    { label: accession },
  ];
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Study {accession}</h2>
      <h3>{data.title}</h3>
      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <RouteForHash hash="#overview" isDefault>
            <Overview data={data} />
          </RouteForHash>
          <RouteForHash hash="#analysis">
            <SummaryTab downloads={data.downloads} />
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default StudyPage;
