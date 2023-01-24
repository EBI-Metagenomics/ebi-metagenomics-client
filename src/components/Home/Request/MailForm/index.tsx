import React, { useContext, useEffect, useState } from 'react';
import Tooltip from 'components/UI/Tooltip';
import InfoBanner from 'components/UI/InfoBanner';
import UserContext, {
  UserDetail,
  getDetailsByWebin,
  getEmailsFromDetails,
} from 'pages/Login/UserContext';
import useMgnifyEmail from 'hooks/data/useMgnifyEmail';
import { ErrorTypes } from 'hooks/data/useData';

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

type MailFormProps = {
  isPublic: boolean;
};

const EMPTY_EMAIL = {
  fromEmail: null,
  subject: null,
  body: null,
  consent: null,
};
const MailForm: React.FC<MailFormProps> = ({ isPublic }) => {
  const [analysisType, setAnalysisType] = useState('Analysis');
  const [rawReadsType, setRawType] = useState('');
  const [accession, setAccession] = useState('');
  const [comments, setComments] = useState('');
  const [result, setResult] = useState('');
  const [isAccessionOK, setAccessionOK] = useState(true);
  const [completed, setCompleted] = useState(false);
  const {
    username,
    details,
    // setUser, setDetails, isAuthenticated, config
  } = useContext(UserContext);
  const [email, setEmail] = useState(EMPTY_EMAIL);
  const {
    data,
    loading,
    error: errorEmail,
  } = useMgnifyEmail(email.fromEmail, email.subject, email.body, email.consent);
  useEffect(() => {
    if (email.fromEmail) {
      if (!loading && data && !errorEmail) {
        setResult(
          `Analysis request for [${accession}] was succesfully submitted.`
        );
      } else if (errorEmail?.type !== ErrorTypes.NullURL) {
        setResult(
          'Failed to send analysis request, please try again or contact our helpdesk.'
        );
      }
      setCompleted(true);
    }
  }, [data, loading, errorEmail, email.fromEmail, accession]);
  useEffect(() => {
    if (accession.length > 0 && !isAccessionOK)
      setResult(
        `Improperly formatted accession, format should be 
        MGYS, ERP, SRP, DRP, PRJEB, PRJNA, PRJDA, PRJDB 
        followed by a number.`
      );
    else setResult('');
  }, [accession, isAccessionOK]);

  const handleAccessionChange = (event) => {
    setAccession(event.target.value);
    setAccessionOK(accessionRegex.test(event.target.value));
  };
  const handleSubmit = () => {
    const { body, subject } = getRequestEmail(
      isPublic,
      analysisType,
      comments,
      accession,
      username,
      getDetailsByWebin(details, username)
    );
    setEmail({
      fromEmail: getEmailsFromDetails(details).join(','),
      body,
      subject,
      consent: false,
    });
  };
  const handleClear = () => {
    setAnalysisType('Analysis');
    setRawType('');
    setAccession('');
    setComments('');
    setResult('');
    setAccessionOK(true);
    setCompleted(false);
    setEmail(EMPTY_EMAIL);
  };
  return (
    <section>
      {isPublic && <h2>Request an analysis of a public dataset</h2>}
      <div className="vf-stack">
        {isPublic && (
          <p>
            Using this form, you can request analysis of a suitable publicly
            available dataset, held within an INSDC database. Enter the study
            accession below and we will prioritise it for analysis with our
            pipeline.
          </p>
        )}
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
          <div className="vf-stack">
            <div>
              <label className="vf-text-heading--4">Are your raw reads</label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="raw-reads-type"
                  value="ShortReads"
                  checked={rawReadsType === 'ShortReads'}
                  onChange={() => setRawType('ShortReads')}
                />
                short-reads (e.g. Illumina)
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="raw-reads-type"
                  value="LongReads"
                  checked={rawReadsType === 'LongReads'}
                  onChange={() => setRawType('LongReads')}
                />
                long-reads (e.g. Oxford Nanopore, PacBio SMRT)
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="raw-reads-type"
                  value="ShortAndLongReads"
                  checked={rawReadsType === 'ShortAndLongReads'}
                  onChange={() => setRawType('ShortAndLongReads')}
                />
                a combination of both short-reads and long-reads for the same
                sample
              </label>
            </div>
          </div>
        </div>
        <div className="vf-grid">
          <label className="vf-text-heading--4">
            Comments / additional information
            {rawReadsType === 'LongReads' ? (
              <p className="vf-text-body--3">
                Please provide details of:
                <ul>
                  <li>the sequencing instrument</li>
                  <li>the base-caller version</li>
                </ul>
              </p>
            ) : null}
            {rawReadsType === 'ShortAndLongReads' ? (
              <p className="vf-text-body--3">
                Please provide details of:
                <ul>
                  <li>the sequencing instrument for long-reads</li>
                  <li>the base-caller version for long-reads</li>
                  <li>
                    the additional study/project IDs if the short- and
                    long-reads were submitted separately
                  </li>
                </ul>
              </p>
            ) : null}
            <textarea
              className="vf-form__textarea"
              name="reason"
              onChange={(event) => setComments(event.target.value)}
              value={comments}
            />
          </label>
        </div>
        <div>
          <button
            className="vf-button vf-button--primary mg-button vf-button--sm "
            type="button"
            onClick={handleSubmit}
            disabled={accession.length === 0 || !isAccessionOK || completed}
          >
            Submit request
          </button>
          <button
            id="clear-button"
            type="button"
            className="vf-button vf-button--sm vf-button--tertiary"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
      {result.length > 0 && <InfoBanner>{result}</InfoBanner>}
    </section>
  );
};

export default MailForm;
