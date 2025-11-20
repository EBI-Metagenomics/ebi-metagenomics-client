import React, { useContext } from 'react';
// import { Publication } from 'components/Publications';
import AnalysesTable from 'components/Analysis/Analyses';
import Box from 'components/UI/Box';
import ExtLink from 'components/UI/ExtLink';
// import SamplesMapByStudy from 'components/UI/SamplesMap/ByStudy';
// import { MGnifyDatum } from 'hooks/data/useData';
import UserContext from 'pages/Login/UserContext';
// import { PublicationAnnotationsPopupBadge } from 'components/Publications/EuropePMCAnnotations';
import ProgrammaticAccessBox from 'components/UI/ProgrammaticAccess';
import { ENA_VIEW_URL } from 'utils/urls';
import { StudyDetail } from '@/interfaces';
import SamplesMapByStudy from 'components/UI/SamplesMap/ByStudy';
import useStudyPublications from 'hooks/data/useStudyPublications';
import FetchError from 'components/UI/FetchError';
import Loading from 'components/UI/Loading';
import { Publication } from 'components/Publications';
import { PublicationAnnotationsPopupBadge } from 'components/Publications/EuropePMCAnnotations';
import { BiomeClassificationFlag } from 'components/UI/BiomeClassificationFlag';

type StudyOverviewProps = {
  data: StudyDetail;
};

const StudyOverview: React.FC<StudyOverviewProps> = ({ data }) => {
  const { config } = useContext(UserContext);
  const lineage = data.biome?.lineage || '';
  const {
    data: publications,
    loading: loadingPublications,
    error,
  } = useStudyPublications(data.accession);
  if (error) return <FetchError error={error} />;
  if (loadingPublications) return <Loading size={'large'} />;
  return (
    <section>
      <div className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <div />
          <h4>Last updated: {new Date(data.updated_at).toDateString()}</h4>
          <Box label="External links">
            <ul data-cy="study-external-links">
              <li>
                <ExtLink href={ENA_VIEW_URL + data.ena_accessions[0]}>
                  ENA website ({data.ena_accessions[0]})
                </ExtLink>
              </li>
            </ul>
          </Box>
          <Box label="Classification">
            <BiomeClassificationFlag lineage={lineage} />
          </Box>
          <Box label="Description">
            {data.metadata.study_description || <i>No description provided</i>}
          </Box>
        </div>
        {data.accession && <SamplesMapByStudy study={data} />}
      </div>
      <br />
      <div>
        {/* {data?.relationships?.studies?.data?.length > 0 && ( */}
        {/*  <Box label="Related studies"> */}
        {/*    <ul className="vf-list"> */}
        {/*      {data.relationships.studies.data.map(({ id }) => ( */}
        {/*        <li key={id as string}> */}
        {/*          <a href={`/metagenomics/studies/${id}`}>{id}</a> */}
        {/*        </li> */}
        {/*      ))} */}
        {/*    </ul> */}
        {/*  </Box> */}
        {/* )} */}
        <div>
          {data?.attributes?.['is-public'] && (
            <Box label="External links">
              <ul className="vf-list">
                <li>
                  <ExtLink href={`${config.enaURL}${data.ena_accessions[0]}`}>
                    ENA website ({data.ena_accessions[0]})
                  </ExtLink>
                </li>
              </ul>
            </Box>
          )}
          {!!publications?.items?.length && (
            <Box label="Publications">
              <ul className="vf-list">
                {publications.items.map((pub) => (
                  <li key={String(pub.pubmed_id)}>
                    <Publication
                      id={String(pub.pubmed_id)}
                      title={pub.title}
                      journal={pub.metadata?.iso_journal || 'unknown'}
                      year={pub.published_year}
                      link={`http://dx.doi.org/${pub.metadata.doi}`}
                      doi={pub.metadata.doi || ''}
                      authors={pub.metadata.authors}
                      maxAuthorsLength={70}
                    >
                      <PublicationAnnotationsPopupBadge
                        pubmedId={String(pub.pubmed_id)}
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
        apiPath={`studies/${data.accession}`}
        entityLabel="Study"
        notebooks={[]}
        isApiV2
        // notebooks={[
        //   {
        //     notebookPath:
        //       'mgnify-examples/R%20Examples/Fetch%20Analyses%20metadata%20for%20a%20Study.ipynb',
        //     notebookLang: 'R',
        //     notebookVars: { MGYS: data.id },
        //   },
        //   {
        //     notebookPath:
        //       'mgnify-examples/Python%20Examples/Load%20Analyses%20for%20a%20MGnify%20Study.ipynb',
        //     notebookLang: 'Python',
        //     notebookVars: { MGYS: data.id },
        //   },
        // ]}
      />
      <br />
      <div>
        <AnalysesTable rootEndpoint="studies" />
      </div>
    </section>
  );
};

export default StudyOverview;
