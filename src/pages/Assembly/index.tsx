import React from 'react';

import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyResponseObj } from '@/hooks/data/useData';
import useURLAccession from '@/hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Box from 'components/UI/Box';
import KeyValueList, { KeyValueItemsList } from 'components/UI/KeyValueList';
import ExtLink from 'components/UI/ExtLink';
import { Link } from 'react-router-dom';
import AssociatedAnalyses from 'components/Analysis/Analyses';
import { ENA_VIEW_URL } from '@/utils/urls';
import ExtraAnnotations from 'components/ExtraAnnotations';

const AssemblyPage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`assemblies/${accession}`);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: assemblyData } = data as MGnifyResponseObj;

  const details = [
    {
      key: 'Sample',
      value: assemblyData?.relationships?.samples?.data?.length
        ? () => (
            <>
              {assemblyData.relationships.samples?.data.map((sample) => (
                <Link to={`/samples/${sample.id}`} key={sample.id as string}>
                  {sample.id}{' '}
                </Link>
              ))}
            </>
          )
        : null,
    },
    {
      key: 'Runs',
      value: assemblyData?.relationships?.runs?.data?.length
        ? () => (
            <>
              {assemblyData.relationships.runs?.data.map((run) => (
                <Link to={`/runs/${run.id}`} key={run.id as string}>
                  {run.id}{' '}
                </Link>
              ))}
            </>
          )
        : null,
    },
    {
      key: 'ENA accession',
      value: () => (
        <ExtLink href={`${ENA_VIEW_URL}${assemblyData?.id}`}>
          {assemblyData?.id}
        </ExtLink>
      ),
    },
    {
      key: 'Legacy accession',
      value: assemblyData.attributes['legacy-accession'] as string,
    },
  ].filter(({ value }) => Boolean(value));
  return (
    <section className="vf-content">
      <h2>Assembly: {assemblyData?.id || ''}</h2>
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <Box label="Description">
            <KeyValueList list={details as KeyValueItemsList} />
          </Box>
          <Box label="Associated analyses">
            <AssociatedAnalyses rootEndpoint="assemblies" />
          </Box>
          <Box label="Additional analyses">
            <p>
              Additional annotations produced by workflows run outside the scope
              of MGnify’s versioned pipelines.
            </p>
            <ExtraAnnotations namespace="assemblies" />
          </Box>
        </div>
      </section>
    </section>
  );
};

export default AssemblyPage;
