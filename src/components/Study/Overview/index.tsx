import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Publication } from 'components/Publications';
import AnalysesTable from 'components/Analysis/Analyses';
import Box from 'components/UI/Box';
import ExtLink from 'components/UI/ExtLink';
import SamplesMapByStudy from 'components/UI/SamplesMap/ByStudy';
import { MGnifyDatum } from 'hooks/data/useData';
import { getBiomeIcon } from 'utils/biomes';
import UserContext from 'pages/Login/UserContext';
import { PublicationAnnotationsPopupBadge } from 'components/Publications/EuropePMCAnnotations';
import ProgrammaticAccessBox from 'components/UI/ProgrammaticAccess';

type StudyOverviewProps = {
  data: MGnifyDatum;
  included: Array<unknown>;
};
const StudyOverview: React.FC<StudyOverviewProps> = ({ data, included }) => {
  const { config } = useContext(UserContext);
  const lineage = data?.relationships?.biomes?.data?.[0]?.id || '';
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
            <div
              className={`biome_icon icon_sm ${getBiomeIcon(lineage)}`}
              style={{ float: 'initial' }}
            />
            <div>{lineage}</div>
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
                      id={id}
                      title={attributes['pub-title']}
                      journal={attributes['iso-journal']}
                      year={attributes['published-year']}
                      link={`http://dx.doi.org/${attributes.doi}`}
                      doi={attributes.doi}
                      authors={attributes.authors}
                      maxAuthorsLength={70}
                    >
                      <PublicationAnnotationsPopupBadge
                        publicationId={id}
                        pubmedId={attributes['pubmed-id']}
                      />
                    </Publication>
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </div>
      </div>
      <ProgrammaticAccessBox
        apiPath={`studies/${data.id}`}
        entityLabel="Study"
        notebooks={[
          {
            notebookPath:
              'mgnify-examples/R%20Examples/Fetch%20Analyses%20metadata%20for%20a%20Study.ipynb',
            notebookLang: 'R',
            notebookVars: { MGYS: data.id },
          },
          {
            notebookPath:
              'mgnify-examples/Python%20Examples/Load%20Analyses%20for%20a%20MGnify%20Study.ipynb',
            notebookLang: 'Python',
            notebookVars: { MGYS: data.id },
          },
        ]}
      />
      <br />
      <div>
        <AnalysesTable rootEndpoint="studies" />
      </div>
    </section>
  );
};

export default StudyOverview;
