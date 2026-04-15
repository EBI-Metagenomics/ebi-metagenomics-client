import React from 'react';

import useRunDetail from '@/hooks/data/useRunDetail';
import useURLAccession from '@/hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Box from 'components/UI/Box';
import KeyValueList from 'components/UI/KeyValueList';
import ExtLink from 'components/UI/ExtLink';
import { Link } from 'react-router-dom';
import AssociatedAssemblies from 'components/Assembly/Assemblies';
import AssociatedAnalyses from 'components/Analysis/Analyses';
import { ENA_VIEW_URL } from '@/utils/urls';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';

const { withQueryParamProvider } =
  createSharedQueryParamContextForTable('analyses');

const RunPage: React.FC = () => {
  const accession = useURLAccession();
  const { data: runData, loading, error } = useRunDetail(accession);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!runData) return <Loading />;

  const details = [
    {
      key: 'Study',
      value: () => {
        if (!runData.study) {
          return (
            <ExtLink href={`${ENA_VIEW_URL}${runData.study_accession}`}>
              {runData.study_accession}
            </ExtLink>
          );
        }
        return (
          <Link to={`/studies/${runData.study.accession}`}>
            {runData.study.accession}
          </Link>
        );
      },
    },
    {
      key: 'Sample',
      value: () => (
        <Link to={`/samples/${runData.sample?.accession}`}>
          {runData.sample?.accession}
        </Link>
      ),
    },
    {
      key: 'ENA accession',
      value: () => (
        <ExtLink href={`${ENA_VIEW_URL}${runData.accession}`}>
          {runData.accession}
        </ExtLink>
      ),
    },
    {
      key: 'Experiment type',
      value: String(runData.experiment_type),
    },
    {
      key: 'Instrument model',
      value: String(runData.instrument_model),
    },
    {
      key: '	Instrument platform type',
      value: String(runData.instrument_platform),
    },
  ];
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    {
      label: 'Associated sample',
      url: `/samples/${runData.sample?.accession}`,
    },
    { label: runData.accession },
  ];
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Run: {runData?.accession || ''}</h2>
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <Box label="Description">
            <KeyValueList list={details} />
          </Box>
          <Box label="Associated analyses">
            <AssociatedAnalyses rootEndpoint="runs" />
          </Box>
          <Box label="Associated assemblies">
            <AssociatedAssemblies rootEndpoint="runs" />
          </Box>
        </div>
      </section>
    </section>
  );
};

export default withQueryParamProvider(RunPage);
