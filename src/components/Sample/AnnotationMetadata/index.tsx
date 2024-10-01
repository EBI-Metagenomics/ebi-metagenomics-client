import React from 'react';
import FetchError from 'components/UI/FetchError';
import Loading from 'components/UI/Loading';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { pickBy } from 'lodash-es';
import { Link } from 'react-router-dom';
import ExtLink from 'components/UI/ExtLink';

type ExistenceData = {
  query_possible: boolean;
  study_has_annotations: {
    [study: string]: boolean;
  };
};

const AnnotationMetadata: React.FC<{ sampleAccession: string }> = ({
  sampleAccession,
}) => {
  const { data, loading, error } = useMGnifyData(
    `samples/${sampleAccession}/studies_publications_annotations_existence`
  );
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  const existenceData = data.data as unknown as ExistenceData;
  const studiesWithAnnotations = Object.keys(
    pickBy(existenceData.study_has_annotations)
  );
  const anyMetadata = studiesWithAnnotations.length > 0;

  if (!existenceData.query_possible)
    return (
      <div
        className="vf-box vf-box-theme--primary vf-box--easy"
        style={{
          backgroundColor: 'lemonchiffon',
        }}
      >
        <h6 className="vf-box__heading">
          <span className="icon icon-common icon-exclamation-triangle" />
          Couldn’t check all studies for metadata
        </h6>
        <p className="vf-box__text">
          Additional metadata for this sample may be available via annotations
          on the publications linked to by the associated studies in the table
          below. Unfortunately these couldn’t be fetched at this time &ndash;
          please view each study to explore more.
        </p>
      </div>
    );

  if (anyMetadata)
    return (
      <div className="vf-box vf-box-theme--primary vf-box--easy">
        <h6 className="vf-box__heading">
          Additional metadata from Publications
        </h6>
        <p className="vf-box__text">
          Additional metadata that may relate to this sample is available via
          publications in the following associated{' '}
          {studiesWithAnnotations.length > 1 ? 'studies' : 'study'}:{' '}
          {studiesWithAnnotations.map((study) => (
            <React.Fragment key={study}>
              <Link to={`/studies/${study}`}>{study}</Link>
              &nbsp;
            </React.Fragment>
          ))}
        </p>
        <p className="vf-box__text">
          These additional metadata are extracted by{' '}
          <ExtLink href="https://europepmc.org">Europe PMC</ExtLink> using
          text-mining on the publications. Browse the studies to explore
          further.
        </p>
      </div>
    );
  return null;
};

export default AnnotationMetadata;
