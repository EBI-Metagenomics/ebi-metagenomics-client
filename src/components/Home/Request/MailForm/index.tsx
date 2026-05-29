import React, { useContext, useEffect, useState } from 'react';
import InfoBanner from 'components/UI/InfoBanner';
import ExtLink from 'components/UI/ExtLink';
import UserContext, {
  UserDetail,
  getDetailsByWebin,
  getEmailsFromDetails,
} from 'pages/Login/UserContext';
import useMgnifyEmail from '@/hooks/data/useMgnifyEmail';
import { ErrorTypes } from '@/hooks/data/useData';
import { toast } from 'react-toastify';

const accessionRegex = /((?:PRJEB|PRJNA|PRJDB|PRJDA|MGYS|ERP|SRP|DRP)\d{5,})/;

const getRequestEmail = (
  isPublic: boolean,
  analysisOption: string,
  comments: string,
  studyAcc: string,
  username: string,
  details: UserDetail
) => {
  const subject = `${
    (isPublic ? 'Public ' : 'Private ') + analysisOption
  } request: ${studyAcc}`;
  const body =
    `Study accession: ${studyAcc};${
      isPublic ? 'Public ' : 'Private '
    } analysis.;` +
    `Analysis option: ${analysisOption} ;` +
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

type EmailRequest = {
  fromEmail?: string;
  subject?: string;
  body?: string;
  consent?: boolean;
};

const EMPTY_EMAIL: EmailRequest = {
  fromEmail: undefined,
  subject: undefined,
  body: undefined,
  consent: undefined,
};

const ANALYSIS_OPTIONS = [
  {
    dataType: 'Amplicon/metabarcoding raw-reads',
    option: 'Analysis (provides taxonomic profile)',
  },
  {
    dataType: 'Metagenomic/metatranscriptomic raw-reads',
    option: 'Analysis only (provides taxonomic profile)',
  },
  {
    dataType: 'Metagenomic/metatranscriptomic raw-reads',
    option:
      'Assembly and analysis (generates and submits contig sequences, provides taxonomic and functional profile)',
  },
  {
    dataType: 'Metagenomic/metatranscriptomic contig assemblies',
    option: 'Analysis (provides taxonomic and functional profile)',
  },
  {
    dataType: 'Mixed (please provide details in the comments box)',
    option: '',
  },
];

const MailForm: React.FC<MailFormProps> = ({ isPublic }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
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
  const [email, setEmail] = useState<EmailRequest>(EMPTY_EMAIL);
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
    if (!username) {
      toast.error('You must be logged in to submit a request');
      throw new Error('You must be logged in to submit a request');
    }
    if (!selectedAnalysis) {
      toast.error('Please select an analysis option');
      return;
    }
    const { body, subject } = getRequestEmail(
      isPublic,
      selectedAnalysis,
      comments,
      accession,
      username,
      getDetailsByWebin(details as UserDetail[], username)
    );
    setEmail({
      fromEmail: getEmailsFromDetails(details as UserDetail[]).join(','),
      body,
      subject,
      consent: false,
    });
  };
  const handleClear = () => {
    setSelectedAnalysis('');
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
            pipeline. For more information, please refer to our{' '}
            <ExtLink href="https://docs.mgnify.org/src/docs/request-analysis.html">
              documentation
            </ExtLink>
            .
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
        <div className="vf-stack">
          <label className="vf-text-heading--4">
            Select the analysis required based on the type of data in your
            study:
          </label>
          <table className="vf-table">
            <thead className="vf-table__header">
              <tr className="vf-table__row">
                <th className="vf-table__heading" scope="col">
                  Data type
                </th>
                <th className="vf-table__heading" scope="col">
                  Analysis options
                </th>
                <th className="vf-table__heading" scope="col" />
              </tr>
            </thead>
            <tbody className="vf-table__body">
              {ANALYSIS_OPTIONS.map((option, index) => (
                <tr
                  className="vf-table__row"
                  key={`${option.dataType}-${index}`}
                >
                  <td className="vf-table__cell">{option.dataType}</td>
                  <td className="vf-table__cell">{option.option}</td>
                  <td className="vf-table__cell">
                    <input
                      type="radio"
                      name="analysis-option"
                      value={option.option || option.dataType}
                      checked={
                        selectedAnalysis === (option.option || option.dataType)
                      }
                      onChange={() =>
                        setSelectedAnalysis(option.option || option.dataType)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="vf-grid">
          <label className="vf-text-heading--4">
            Comments / additional information
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
            disabled={
              accession.length === 0 ||
              !isAccessionOK ||
              completed ||
              !selectedAnalysis
            }
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
