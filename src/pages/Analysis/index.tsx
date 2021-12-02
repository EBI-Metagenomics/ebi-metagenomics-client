import React from 'react';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyDatum, MGnifyResponseObj } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import Overview from 'components/Analysis/Overview';
import QualityControl from 'components/Analysis/QualityControl';
import RouteForHash from 'components/Nav/RouteForHash';
import { Link } from 'react-router-dom';

const hasAbundance = (
  includes: { attributes?: { 'group-type'?: string } }[]
): boolean => {
  return includes.some(
    (included) => included?.attributes?.['group-type'] === 'Statistics'
  );
};

const isAssembly = (data: MGnifyDatum): boolean =>
  data.attributes['experiment-type'] === 'assembly';
const isAtleastVersion5 = (data: MGnifyDatum): boolean =>
  Number(data.attributes['pipeline-version']) >= 5;
const isNotAmplicon = (data: MGnifyDatum): boolean =>
  data.attributes['experiment-type'] !== 'amplicon';

const AnalysisPage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`analyses/${accession}`, {
    include: 'downloads',
  });
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: analysisData, included } = data as MGnifyResponseObj;

  const tabs = [
    { label: 'Overview', to: '#overview' },
    { label: 'Quality control', to: '#qc' },
    { label: 'Taxonomic analysis', to: '#taxonomic' },
    isNotAmplicon(analysisData)
      ? { label: 'Functional analysis', to: '#functional' }
      : null,
    hasAbundance(included)
      ? { label: 'Abundance and comparison', to: '#abundance' }
      : null,
    isAssembly(analysisData) && isAtleastVersion5(analysisData)
      ? { label: 'Pathways/Systems', to: '#path-systems' }
      : null,
    isAssembly(analysisData) && isAtleastVersion5(analysisData)
      ? { label: 'Contig Viewer', to: '#contigs-viewer' }
      : null,
    { label: 'Download', to: '#download' },
  ].filter(Boolean);

  return (
    <section className="vf-content">
      <h2>Analysis {accession}</h2>
      <h4>
        <Link
          to={
            isAssembly(analysisData)
              ? `/assemblies/${analysisData.relationships.assembly.data.id}`
              : `/runs/${analysisData.relationships.run.data.id}`
          }
        >
          Other Analyses
        </Link>
      </h4>
      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <RouteForHash hash="#overview" isDefault>
            <Overview data={analysisData} />
          </RouteForHash>
          <RouteForHash hash="#qc">
            <QualityControl data={analysisData} />
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default AnalysisPage;
