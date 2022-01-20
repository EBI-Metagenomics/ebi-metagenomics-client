import React, { useState } from 'react';
import MailForm from '../MailForm';

const PrivateRequest: React.FC = () => {
  const [confirmSubmitted, setConfirmSubmitted] = useState('');
  return (
    <section>
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
      {confirmSubmitted === 'Yes' && <MailForm isPublic={false} />}
      {confirmSubmitted === 'No' && 'SUBMIT!!!!'}
    </section>
  );
};

export default PrivateRequest;
