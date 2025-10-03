import React from 'react';

import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import { RouteTabs } from 'components/UI/Tabs';
import Overview from 'components/Study/Overview';
import SummaryTab from 'components/Study/SummaryTab';
import useCanonicalAccessionRedirect from '@/hooks/useCanonicalAccessionRedirect';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import useStudyDetail from 'hooks/data/useStudyDetail';
import { EnaDerivedObject } from '@/interfaces';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';
import { Navigate, Route, Routes } from 'react-router-dom';

const tabs = [
  { label: 'Overview', to: 'overview' },
  { label: 'Analysis summary', to: 'analysis' },
];

const { withQueryParamProvider } =
  createSharedQueryParamContextForTable('analyses');

const StudyPage: React.FC = () => {
  const accession = useURLAccession();

  const { data, loading, error } = useStudyDetail(accession || '');

  useCanonicalAccessionRedirect(data as EnaDerivedObject);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Studies', url: '/browse/studies' },
    { label: accession as string },
  ];
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Study {accession}</h2>
      <h3>{data.title}</h3>
      <RouteTabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview data={data} />} />
            <Route
              path="analysis"
              element={<SummaryTab downloads={data.downloads} />}
            />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </div>
      </section>
    </section>
  );
};

export default withQueryParamProvider(StudyPage);
