import React from 'react';

import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyResponseObj } from '@/hooks/data/useData';
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
import ExtraAnnotations from 'components/ExtraAnnotations';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';

const { withQueryParamProvider } =
  createSharedQueryParamContextForTable('analyses');

const RunPage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`runs/${accession}`);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: runData } = data as MGnifyResponseObj;

  const details = [
    {
      key: 'Study',
      value: () => {
        if (!runData.relationships.study?.data) {
          return (
            <ExtLink
              href={`${ENA_VIEW_URL}${runData.attributes['ena-study-accession']}`}
            >
              {runData.attributes['ena-study-accession']}
            </ExtLink>
          );
        }
        return (
          <Link to={`/studies/${runData.relationships.study.data.id}`}>
            {runData.relationships.study.data.id}
          </Link>
        );
      },
    },
    {
      key: 'Sample',
      value: () => (
        <Link to={`/samples/${runData.relationships.sample?.data.id}`}>
          {runData.relationships.sample?.data.id}
        </Link>
      ),
    },
    {
      key: 'ENA accession',
      value: () => (
        <ExtLink href={`${ENA_VIEW_URL}${runData.id}`}>{runData.id}</ExtLink>
      ),
    },
    {
      key: 'Experiment type',
      value: String(runData.attributes['experiment-type']),
    },
    {
      key: 'Instrument model',
      value: String(runData.attributes['instrument-model']),
    },
    {
      key: '	Instrument platform type',
      value: String(runData.attributes['instrument-platform']),
    },
  ];
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    {
      label: 'Associated sample',
      url: `/samples/${runData.relationships.sample?.data.id}`,
    },
    { label: runData.id },
  ];
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Run: {runData?.id || ''}</h2>
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
          <Box label="Additional analyses">
            <p>
              Additional annotations produced by workflows run outside the scope
              of MGnify’s versioned pipelines.
            </p>
            <ExtraAnnotations namespace="runs" />
          </Box>
        </div>
      </section>
    </section>
  );
};

export default withQueryParamProvider(RunPage);
