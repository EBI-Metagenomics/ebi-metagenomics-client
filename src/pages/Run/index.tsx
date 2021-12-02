import React from 'react';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseObj } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Box from 'components/UI/Box';
import KeyValueList from 'components/UI/KeyValueList';
import ExtLink from 'components/UI/ExtLink';
import { Link } from 'react-router-dom';
import AssociatedAssemblies from 'src/components/Assembly/Assemblies';
import AssociatedAnalyses from 'src/components/Analysis/Analyses';
import { ENA_VIEW_URL } from 'utils/urls';

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
      value: () => (
        <Link to={`/studies/${runData.relationships.study.data.id}`}>
          {runData.relationships.study.data.id}
        </Link>
      ),
    },
    {
      key: 'Sample',
      value: () => (
        <Link to={`/samples/${runData.relationships.sample.data.id}`}>
          {runData.relationships.sample.data.id}
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
  return (
    <section className="vf-content">
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
        </div>
      </section>
    </section>
  );
};

export default RunPage;
