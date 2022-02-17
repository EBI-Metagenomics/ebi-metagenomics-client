import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GlobalOverlayedContent from 'components/UI/GlobalOverlayedContent';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import ExtLink from 'components/UI/ExtLink';
import UserContext, { getEmailsFromDetails } from 'pages/Login/UserContext';
import useMgnifyEmail from 'hooks/data/useMgnifyEmail';

import processImg from 'images/submission_process.svg';

const SubmitPage: React.FC = () => {
  const consentCheckboxRef = useRef(null);
  const { username, isAuthenticated, details } = useContext(UserContext);
  const [hasGivenConsent, setGivenConsent] = useState(false);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
    if (!loading && data && !errorEmail) {
      setGivenConsent(true);
    }
  }, [data, loading, errorEmail]);

  const handleConsentClick = (): void => {
    if (!consentCheckboxRef.current.checked) {
      setError(true);
    } else {
      setError(false);
      setEmail({
        fromEmail: getEmailsFromDetails(details).join(','),
        subject: 'Request consent',
        body: `I consent for the MGnify team to analyse the private data of my account ${username}`,
        consent: true,
      });
    }
  };
  return (
    <section className="vf-content">
      <GlobalOverlayedContent show={showModal} setShowModal={setShowModal}>
        <img
          src={processImg}
          alt="MGnify Submission Process"
          style={{ height: '80vh' }}
        />
      </GlobalOverlayedContent>
      <h2>Submit data</h2>
      <p>
        We provide a free service for submission of raw metagenomics sequence
        data and associated metadata to the European Nucleotide Archive (ENA)
        and analysis by MGnify.
      </p>
      <p>
        If you have data that you wish to have analysed, you need an ENA
        submitter account that has been registered with the MGnify. This allows
        us to track your submitted data and ensures that we have consent to
        access it for analysis.
      </p>
      <p>
        With a valid ENA submitter account, you can submit your data directly
        using the{' '}
        <ExtLink href="https://www.ebi.ac.uk/ena/submit/sra/#home">
          ENA Webin tool
        </ExtLink>
        , which will help you describe your metadata and upload your sequence
        data.
      </p>
      <p>
        Once your reads are uploaded to ENA, navigate to the home page, click
        &apos;Submit and/or Request&apos; and complete the form to request an
        analysis with MGnify. You will receive an email once the analysis starts
        and another when the analysis of all samples is complete (
        <button
          type="button"
          className="vf-button vf-button--link mg-button-as-link"
          onClick={() => setShowModal(true)}
        >
          View figure for more details
        </button>{' '}
        of the submission and analysis process). The analysis time is dependent
        on the number of samples submitted and requests by other submitters at
        the time. If your samples are private, you will need to log in to MGnify
        to be able to view the results of the analysis.
      </p>
      {!isAuthenticated && (
        <Link to="/login" className="vf-button vf-button--primary">
          Login with Webin
        </Link>
      )}
      {isAuthenticated && !hasGivenConsent && (
        <div id="consent">
          <br />
          <h4>
            Your Webin account is currently not registered with MGnify. You have
            the choice to register with us now.
          </h4>
          <p>
            Note, if you plan to submit pre-publication data for analysis, which
            is to be held as confidential, we need consent to access your data
            in accordance with ENA’s policies. By keeping this box checked, you
            consent to the MGnify team analysing your private data. Note that
            the data, as well as the analysis results, will remain confidential
            until the release date you specify when submitting your sequencing
            study. If you are also requesting assembly of your data, you will
            also be providing consent to MGnify to submit these assemblies to
            your ENA study on your behalf. MGnify will not change any metadata
            or data you have already submitted but may need to perform updates
            to submissions performed by their team in exceptional circumstances.
            You also confirm that the data submitted through this account is NOT
            sensitive, restricted-access or human-identifiable.
          </p>
          <label
            className="vf-box vf-box-theme--quinary vf-box--normal"
            style={{
              border: error ? '1px solid red' : 0,
            }}
          >
            {' '}
            <input
              id="consent-given"
              type="checkbox"
              ref={consentCheckboxRef}
            />
            I give consent for the MGnify team to analyse my private data and
            confirm that the data submitted through this account is NOT
            sensitive, restricted-access or human-identifiable.
          </label>
          {error && <p>*Please check the box above.</p>}
          <p className="vf-box vf-box--easy">
            The following email addresses will be notified of the registration
            of <code>{username}</code>:{' '}
            {details ? (
              getEmailsFromDetails(details).map((mail) => (
                <React.Fragment key={mail}>
                  <code>{mail}</code>{' '}
                </React.Fragment>
              ))
            ) : (
              <Loading size="small" />
            )}
          </p>
          <p>
            <button
              type="button"
              className="vf-button vf-button--primary"
              onClick={handleConsentClick}
            >
              Give consent
            </button>
          </p>
          {loading && <Loading />}
          {errorEmail && <FetchError error={errorEmail} />}
        </div>
      )}
      {isAuthenticated && hasGivenConsent && (
        <>
          <div id="action">
            <a
              id="submit"
              href="https://www.ebi.ac.uk/ena/submit/sra/#home"
              className="vf-button vf-button--primary"
            >
              Click here to submit data
            </a>
          </div>
          <p className="vf-box vf-box--easy">
            Successfully requested consent to analyse user data. Click{' '}
            <Link to="/">here</Link> to return to the home page.
          </p>
        </>
      )}
      {error && (
        <p className="center hidden error" id="consent-request-error">
          Failed to send request, please try again or contact our helpdesk.
        </p>
      )}
    </section>
  );
};

export default SubmitPage;
