import React, { useContext, useEffect, useState } from 'react';
import Tooltip from 'components/UI/Tooltip';
import InfoBanner from 'src/components/UI/InfoBanner';
import UserContext, {
  UserDetail,
  getDetailsByWebin,
  getEmailsFromDetails,
} from 'pages/Login/UserContext';
import useMgnifyEmail from 'src/hooks/data/useMgnifyEmail';

const accessionRegex = /((?:PRJEB|PRJNA|PRJDB|PRJDA|MGYS|ERP|SRP|DRP)\d{5,})/;

const getRequestEmail = (
  isPublic: boolean,
  analysisType: string,
  comments: string,
  studyAcc: string,
  username: string,
  details: UserDetail
) => {
  const subject = `${
    (isPublic ? 'Public ' : 'Private ') + analysisType
  } request: ${studyAcc}`;
  const body =
    `Study accession: ${studyAcc};${
      isPublic ? 'Public ' : 'Private '
    } analysis.;` +
    `Analysis type: ${analysisType} ;` +
    `Requester name: ${details.attributes['first-name']} ${details.attributes.surname}.;` +
    `Email: ${details.attributes['email-address']}.;` +
    `Webin: ${username}.;` +
    `Additional notes: ${comments}.;`;
  return {
    body,
    subject,
  };
};
const RequestPublic: React.FC = () => {
  const [analysisType, setAnalysisType] = useState('Analysis');
  const [accession, setAccession] = useState('');
  const [comments, setComments] = useState('');
  const [result, setResult] = useState('');
  const [isAccessionOK, setAccessionOK] = useState(true);
  const {
    username,
    details,
    // setUser, setDetails, isAuthenticated, config
  } = useContext(UserContext);
  const [email, setEmail] = useState({
    fromEmail: null,
    subject: null,
    body: null,
    consent: null,
  });
  const {
    data,
    loading,
    error: errorEmail,
  } = useMgnifyEmail(email.fromEmail, email.subject, email.body, email.consent);
  useEffect(() => {
    if (email.fromEmail) {
      if (!loading && data && !errorEmail) {
        setResult('Analysis request was succesfully submitted.');
      } else if (!loading && (!data || errorEmail)) {
        setResult(
          'Failed to send analysis request, please try again or contact our helpdesk.'
        );
      }
    }
  }, [data, loading, errorEmail, email.fromEmail]);
  useEffect(() => {
    if (accession.length > 0 && !isAccessionOK)
      setResult(
        `Improperly formatted accession, format should be 
        MGYS, ERP, SRP, DRP, PRJEB, PRJNA, PRJDA, PRJDB 
        followed by a number.`
      );
    else setResult('');
  }, [accession, isAccessionOK]);
  // useEffect(() => {
  //   //Fake login
  //   setUser({ username: 'Webin-460', isAuthenticated: true });
  //   setDetails([
  //     {
  //       type: 'submitters',
  //       id: 'Webin-460',
  //       attributes: {
  //         'first-name': '',
  //         surname: '',
  //         'email-address': 'metagenomics@ebi.ac.uk',
  //         analysis: true,
  //         submitter: true,
  //       },
  //     },
  //   ]);
  // }, []);

  const handleAccessionChange = (event) => {
    setAccession(event.target.value);
    setAccessionOK(accessionRegex.test(event.target.value));
  };
  const handleSubmit = () => {
    const { body, subject } = getRequestEmail(
      true,
      analysisType,
      comments,
      accession,
      username,
      getDetailsByWebin(details, username)
    );
    setEmail({
      fromEmail: getEmailsFromDetails(details),
      body,
      subject,
      consent: false,
    });
  };
  return (
    <section>
      <h2>Request an analysis of a public dataset</h2>
      <div className="vf-stack">
        <p>
          Using this form, you can request analysis of a suitable publicly
          available dataset, held within an INSDC database. Enter the study
          accession below and we will prioritise it for analysis with our
          pipeline.
        </p>
        <div>
          <label className="vf-text-heading--4">
            Study accession
            <input
              id="study-accession"
              name="study-accession"
              className="vf-form__input"
              type="text"
              pattern="study_accession"
              placeholder="MGYS###### / ERP###### / SRP###### / DRP###### / PRJ######"
              value={accession}
              onChange={handleAccessionChange}
              required
            />
          </label>
        </div>
        <div className="vf-grid">
          <div className="vf-stack">
            <label className="vf-text-heading--4">
              Analysis type{' '}
              <Tooltip
                content={`You can request either analysis of raw reads or assembly of the data 
                  (where suitable) prior to analysis. Note, assembly may not be feasible for 
                  all datasets and may take additional time, particularly for larger studies.`}
              >
                <sup>
                  <span
                    className="icon icon-common icon-info"
                    data-cy="public-help-tooltip"
                  />
                </sup>
              </Tooltip>
            </label>
            <div>
              <label>
                <input
                  type="radio"
                  name="analysis-type"
                  value="Analysis"
                  checked={analysisType === 'Analysis'}
                  onChange={() => setAnalysisType('Analysis')}
                />
                Analysis only
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="analysis-type"
                  value="Assembly+Analysis"
                  checked={analysisType === 'Assembly+Analysis'}
                  onChange={() => setAnalysisType('Assembly+Analysis')}
                />
                Assembly and analysis
              </label>
            </div>
          </div>
          <div>
            <label className="vf-text-heading--4">
              Comment / additional information
              <input
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                type="text"
                className="vf-form__input"
                name="reason"
              />
            </label>
          </div>
        </div>
        <div>
          <button
            className="vf-button mg-button"
            type="button"
            onClick={handleSubmit}
            disabled={accession.length === 0 || !isAccessionOK}
          >
            Submit request
          </button>
        </div>
      </div>
      {result.length > 0 && <InfoBanner>{result}</InfoBanner>}
    </section>
  );
};

export default RequestPublic;