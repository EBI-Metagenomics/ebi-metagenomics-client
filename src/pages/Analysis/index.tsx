import React, { useMemo } from 'react';

import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import { RouteTabs } from 'components/UI/Tabs';
import Overview from 'components/Analysis/Overview';
import QualityControl from 'components/Analysis/QualityControl/v2index';
import LegacyQualityControl from 'components/Analysis/QualityControl/index';
import LegacyContigViewer from 'components/Analysis/ContigViewer/index';
import ContigViewer from 'components/Analysis/ContigViewer/v2index';
import FunctionalSubpage from 'components/Analysis/Functional';
import PathwaysSubpage from 'components/Analysis/Pathways';
import Downloads from 'components/Downloads/v2index';
import V2AnalysisContext, {
  AnalysisContextType,
} from 'pages/Analysis/V2AnalysisContext';
import useAnalysisDetail from 'hooks/data/useAnalysisDetail';
import { AnalysisDetail } from '@/interfaces';
import Asv from 'components/Asv';
import WGSTaxonomy from 'components/Analysis/WGSTaxonomy';
import AmpliconTaxonomy from 'components/Analysis/AmpliconTaxonomy';
import LegacyTaxonomy from 'components/Analysis/Taxonomy/LegacyTaxonomy';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import { Navigate, Route, Routes } from 'react-router-dom';

const isAssembly = (
  experimentType: AnalysisDetail['experiment_type']
): boolean => experimentType.toLowerCase().endsWith('assembly');

const isAmplicon = (
  experimentType: AnalysisDetail['experiment_type']
): boolean => {
  return experimentType.toLowerCase() === 'amplicon';
};

const AnalysisPage: React.FC = () => {
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

  const thisIsV6Family = useMemo(
    () => data?.pipeline_version?.startsWith('V6'),
    [data?.pipeline_version]
  );

  const pipelineVersion = useMemo(
    () =>
      data?.pipeline_version
        ? parseFloat(data.pipeline_version.replace('V', ''))
        : 0,
    [data?.pipeline_version]
  );

  const tabs = useMemo(() => {
    if (!data?.accession)
      return [] as { label: string | React.ElementType; to: string }[];
    return [
      { label: 'Overview', to: 'overview' },
      { label: 'Quality control', to: 'qc' },
      { label: 'Taxonomy', to: 'taxonomic' },
      thisIsAssembly
        ? { label: 'Functional analysis', to: 'functional' }
        : null,
      thisIsAssembly && pipelineVersion >= 5
        ? { label: 'Pathways/Systems', to: 'path-systems' }
        : null,
      thisIsAssembly && pipelineVersion >= 5
        ? { label: 'Contig Viewer', to: 'contigs-viewer' }
        : null,
      thisIsAmplicon && thisIsV6Family ? { label: 'ASV', to: 'asv' } : null,
      { label: 'Downloads', to: 'download' },
    ].filter(Boolean) as { label: string | React.ElementType; to: string }[];
  }, [
    data?.accession,
    thisIsAssembly,
    thisIsAmplicon,
    thisIsV6Family,
    pipelineVersion,
  ]);

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
              <Route
                path="qc"
                element={
                  thisIsV6Family ? <QualityControl /> : <LegacyQualityControl />
                }
              />
              <Route path="asv" element={<Asv />} />
              <Route
                path="contigs-viewer/*"
                element={
                  thisIsV6Family ? <ContigViewer /> : <LegacyContigViewer />
                }
              />
              <Route
                path="taxonomic"
                element={
                  // eslint-disable-next-line no-nested-ternary
                  thisIsV6Family ? (
                    isAmplicon(data.experiment_type) ? (
                      <AmpliconTaxonomy />
                    ) : (
                      <WGSTaxonomy />
                    )
                  ) : (
                    <LegacyTaxonomy />
                  )
                }
              />
              <Route path="functional" element={<FunctionalSubpage />} />
              <Route path="path-systems" element={<PathwaysSubpage />} />
              <Route path="download" element={<Downloads />} />
            </Routes>
          </V2AnalysisContext.Provider>
        </div>
      </section>
    </section>
  );
};

export default AnalysisPage;
