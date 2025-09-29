import React, { useMemo } from 'react';

import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import { RouteTabs } from 'components/UI/Tabs';
import Overview from 'components/Analysis/Overview/v2index';
import QualityControl from 'components/Analysis/QualityControl/v2index';
import ContigViewer from 'components/Analysis/ContigViewer/v2index';
import FunctionalSubpage from 'components/Analysis/Functional/v2index';
import PathwaysSubpage from 'components/Analysis/Pathways/v2Index';
import Downloads from 'components/Downloads/v2index';
import Abundance from 'components/Analysis/Abundance';
import V2AnalysisContext, { AnalysisContextType } from 'pages/Analysis/V2AnalysisContext';
import useAnalysisDetail from 'hooks/data/useAnalysisDetail';
import { AnalysisDetail } from 'interfaces/index';
import Asv from 'components/Asv';
import AssemblyTaxonomy from 'components/Analysis/AssemblyTaxonomy';
import Taxonomy from 'components/Analysis/Taxonomy/v2index';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import { Navigate, Route, Routes } from 'react-router-dom';

// TODO: find v2 counterpart

const isAssembly = (
  experimentType: AnalysisDetail['experiment_type']
): boolean => experimentType.toLowerCase().endsWith('assembly');

const isNotAmplicon = (
  experimentType: AnalysisDetail['experiment_type']
): boolean => {
  return experimentType.toLowerCase() !== 'amplicon';
};

const isAmplicon = (
  experimentType: AnalysisDetail['experiment_type']
): boolean => {
  return experimentType.toLowerCase() === 'amplicon';
};

const V2AnalysisPage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useAnalysisDetail(accession);

  const value = useMemo(
    () => ({ overviewData: data } as AnalysisContextType),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.accession]
  );

  const thisIsAssembly = useMemo(
    () => data?.experiment_type && isAssembly(data.experiment_type),
    [data?.experiment_type]
  );
  const thisIsAmplicon = useMemo(
    () => data?.experiment_type && isAmplicon(data.experiment_type),
    [data?.experiment_type]
  );
  const thisIsNotAmplicon = useMemo(
    () => data?.experiment_type && isNotAmplicon(data.experiment_type),
    [data?.experiment_type]
  );

  const tabs = useMemo(() => {
    if (!data?.accession)
      return [] as { label: string | React.ElementType; to: string }[];
    return [
      { label: 'Overview', to: 'overview' },
      { label: 'Quality control', to: 'qc' },
      { label: 'Taxonomy', to: 'taxonomic' },
      thisIsNotAmplicon
        ? { label: 'Functional analysis', to: 'functional' }
        : null,
      thisIsNotAmplicon
        ? { label: 'Pathways/Systems', to: 'path-systems' }
        : null,
      thisIsAssembly ? { label: 'Contig Viewer', to: 'contigs-viewer' } : null,
      thisIsAmplicon ? { label: 'ASV', to: 'asv' } : null,
    ].filter(Boolean) as { label: string | React.ElementType; to: string }[];
  }, [thisIsNotAmplicon, thisIsAssembly, thisIsAmplicon, data?.accession]);

  const breadcrumbs = useMemo(() => {
    if (!data?.accession) return [] as Array<{ label: string; url?: string }>;
    return [
      { label: 'Home', url: '/' },
      { label: 'Studies', url: '/browse/studies' },
      { label: data.study_accession, url: '/studies/' + data.study_accession },
      { label: data.accession },
    ];
  }, [data?.accession, data?.study_accession]);

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Analysis {accession}</h2>
      <RouteTabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <V2AnalysisContext.Provider value={value}>
            <Routes>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="qc" element={<QualityControl />} />
              <Route path="asv" element={<Asv />} />
              <Route path="contigs-viewer/*" element={<ContigViewer />} />
              <Route
                path="taxonomic"
                element={
                  isAssembly(data.experiment_type) ? (
                    <AssemblyTaxonomy />
                  ) : (
                    <Taxonomy />
                  )
                }
              />
              <Route path="functional" element={<FunctionalSubpage />} />
              <Route path="abundance" element={<Abundance />} />
              <Route path="path-systems" element={<PathwaysSubpage />} />
              <Route path="download" element={<Downloads />} />
            </Routes>
          </V2AnalysisContext.Provider>
        </div>
      </section>
    </section>
  );
};

export default V2AnalysisPage;
