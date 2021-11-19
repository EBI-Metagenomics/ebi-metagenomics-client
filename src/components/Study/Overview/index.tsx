import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { MGnifyDatum } from 'hooks/data/useData';
import SamplesMapByStudy from 'components/UI/SamplesMap/ByStudy';
import Box from 'components/UI/Box';
import { getBiomeIcon } from 'utils/biomes';
import { Publication } from 'components/Publications';
import AnalysesTable from 'components/Analyses/Table';
import ExtLink from 'components/UI/ExtLink';
import UserContext from 'pages/Login/UserContext';

type StudyOverviewProps = {
  data: MGnifyDatum;
  included: Array<unknown>;
};
const StudyOverview: React.FC<StudyOverviewProps> = ({ data, included }) => {
  const { config } = useContext(UserContext);
  const lineage = data.relationships.biomes.data[0].id;
  const publications = included.filter(({ type }) => type === 'publications');
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
          <Box label="Classification">
            <span
              className={`biome_icon icon_sm ${getBiomeIcon(lineage)}`}
              style={{ float: 'initial' }}
            />
            {lineage}
          </Box>
          <Box label="Description">{data.attributes['study-abstract']}</Box>
        </div>
        <SamplesMapByStudy study={data.id} />
      </div>
      <br />
      <div className="mg-flex">
        {data?.relationships?.studies?.data?.length > 0 && (
          <Box label="Related studies">
            <ul className="vf-list">
              {data.relationships.studies.data.map(({ id }) => (
                <li key={id as string}>
                  <Link to={`/studies/${id}`}>{id}</Link>
                </li>
              ))}
            </ul>
          </Box>
        )}
        <div>
          {data?.attributes?.['is-public'] && (
            <Box label="External links">
              <ul className="vf-list">
                <li>
                  <ExtLink
                    href={`${config.enaURL}/${data.attributes['secondary-accession']}`}
                  >
                    ENA website ({data.attributes['secondary-accession']})
                  </ExtLink>
                </li>
              </ul>
            </Box>
          )}
          {publications?.length > 0 && (
            <Box label="Publications">
              <ul className="vf-list">
                {publications.map(({ attributes, id }) => (
                  <li key={id as string}>
                    <Publication
                      title={attributes['pub-title']}
                      journal={attributes['iso-journal']}
                      year={attributes['published-year']}
                      link={`http://${attributes.doi}`}
                      doi={attributes.doi}
                      authors={attributes.authors}
                      maxAuthorsLength={70}
                    />
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </div>
      </div>
      <br />
      <div>
        <AnalysesTable />
      </div>
    </section>
  );
};

export default StudyOverview;
