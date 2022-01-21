import React, { useState } from 'react';
import MailForm from '../MailForm';

const PrivateRequest: React.FC = () => {
  const [confirmSubmitted, setConfirmSubmitted] = useState('');
  return (
    <section className="vf-stack vf-stack--400">
      <h2>Request an analysis of your data</h2>
      <div className="vf-stack">
        <label className="vf-text-heading--4">
          Has your data already been submitted?{' '}
        </label>
        <div>
          <label>
            <input
              type="radio"
              name="dataSubmitted"
              value="Yes"
              checked={confirmSubmitted === 'Yes'}
              onChange={() => setConfirmSubmitted('Yes')}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="analysis-type"
              value="No"
              checked={confirmSubmitted === 'No'}
              onChange={() => setConfirmSubmitted('No')}
            />
            No
          </label>
        </div>
      </div>
      <hr />
      {confirmSubmitted === 'Yes' && (
        <>
          <MailForm isPublic={false} />
          <p>
            The analysis of your data will be held confidentially on our site
            until the hold date expires.
          </p>
        </>
      )}
      {confirmSubmitted === 'No' && (
        <div className="vf-stack">
          <p>
            Please submit your data before requesting analysis as it must be
            archived in the ENA for us to process it.
          </p>
          <div className="mg-right">
            <a
              className="vf-button vf-button--primary vf-button--sm"
              href="https://www.ebi.ac.uk/ena/submit/sra/"
            >
              <span className="icon icon-common icon-external-link-alt" /> Go to
              ENA submission page
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default PrivateRequest;
