import React from 'react';
import FetchError from 'components/UI/FetchError';
import Loading from 'components/UI/Loading';
import useMGnifyData from 'hooks/data/useMGnifyData';
import ExtLink from 'components/UI/ExtLink';
import KeyValueList from 'components/UI/KeyValueList';

type Curation = {
  attributePost: string;
  valuePost: string;
  assertionMethod: string;
  updatedTimestamp: string;
  assertionEvidences: [
    {
      identifier: string;
      label: string;
    }
  ];
};

const ClearingHouseMetadata: React.FC<{ sampleAccession: string }> = ({
  sampleAccession,
}) => {
  const { data, loading, error } = useMGnifyData(
    `samples/${sampleAccession}/contextual_data_clearing_house_metadata`
  );
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  const curationsData = data.data as unknown as [Curation];

  const anyMetadata = curationsData.length > 0;

  if (anyMetadata)
    return (
      <div
        className="vf-box vf-box-theme--primary vf-box--easy"
        id="cdch-sample-metadata"
      >
        <h6 className="vf-box__heading">
          Additional metadata from Elixir’s Contextual Data Clearing House
        </h6>
        <p className="vf-box__text">
          Additional metadata for this sample has been added to the{' '}
          <ExtLink href="https://elixir-europe.org/internal-projects/commissioned-services/establishment-data-clearinghouse">
            Contextual Data Clearing House.
          </ExtLink>
        </p>
        <div>
          <details>
            <summary>
              <b>Curations for sample {sampleAccession}</b>
            </summary>
            <div className="vf-box__text">
              <KeyValueList
                list={curationsData.map((curation: Curation) => {
                  const evidences = curation.assertionEvidences
                    .map((evidence) => evidence.label || evidence.identifier)
                    .join(', ');
                  return {
                    key: curation.attributePost,
                    value: () => (
                      <div>
                        <span className="vf-text-body">
                          {curation.valuePost}
                        </span>
                        <br />
                        <span className="vf-text-body vf-text-body--5">
                          Updated{' '}
                          {new Date(
                            curation.updatedTimestamp
                          ).toLocaleDateString()}
                          .{' '}
                        </span>
                        <span className="vf-text-body vf-text-body--5">
                          Evidence: {evidences}.
                        </span>
                      </div>
                    ),
                  };
                })}
              />
            </div>
          </details>
        </div>
      </div>
    );
  return null;
};

export default ClearingHouseMetadata;