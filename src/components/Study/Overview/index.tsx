import React from 'react';
import { MGnifyDatum } from 'hooks/data/useData';
import SamplesMap from 'src/components/UI/SamplesMap';
import { getBiomeIcon } from 'utils/biomes';

type StudyOverviewProps = {
  data: MGnifyDatum;
};
const StudyOverview: React.FC<StudyOverviewProps> = ({ data }) => {
  const lineage = data.relationships.biomes.data[0].id;
  return (
    <section>
      <div className="vf-grid">
        <div>
          <h4>
            Last updated:{' '}
            {new Date(
              data?.attributes?.['last-update'] as string
            ).toDateString()}
          </h4>
          <div className="vf-box vf-box--easy vf-box-theme--primary">
            <h5 className="vf-box__heading">Classification</h5>
            <p className="vf-box__text">
              <span
                className={`biome_icon icon_sm ${getBiomeIcon(lineage)}`}
                style={{ float: 'initial' }}
              />
              {lineage}
            </p>
          </div>
          <div className="vf-box vf-box--easy vf-box-theme--primary">
            <h5 className="vf-box__heading">Description</h5>
            <p className="vf-box__text">{data.attributes['study-abstract']}</p>
          </div>
        </div>
        <SamplesMap study={data.id} />
      </div>
      <div className="vf-box vf-box--easy vf-box-theme--primary">
        <h5 className="vf-box__heading">Related studies</h5>
        <p className="vf-box__text" />
      </div>
    </section>
  );
};

export default StudyOverview;
