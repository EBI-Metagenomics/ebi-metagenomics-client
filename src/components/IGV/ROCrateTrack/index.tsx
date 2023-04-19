import React, { useEffect, useState } from 'react';
import EMGModal from 'components/UI/EMGModal';

type ROCratePreviewProps = {
  trackView: any;
};

const ROCratePreview: React.FC<ROCratePreviewProps> = ({ trackView }) => {
  const [cratePreview, setCratePreview] = useState('');
  const [crateModalOpen, setCrateModalOpen] = useState(false);

  useEffect(() => {
    if (trackView.track.config.crate) {
      trackView.track.config.crate.zip
        .file('ro-crate-preview.html')
        .async('string')
        .then(setCratePreview);
    }
  }, [trackView]);

  if (!cratePreview.length) {
    return null;
  }

  return (
    <>
      <span className="vf-text-body vf-text-body--4">
        <button
          className="vf-button vf-button--link mg-button-as-link"
          onClick={() => setCrateModalOpen(true)}
          type="button"
        >
          Browse the RO-Crate
        </button>{' '}
        providing this track
      </span>
      <EMGModal
        isOpen={crateModalOpen}
        onRequestClose={() => setCrateModalOpen(false)}
        contentLabel="RO-Crate preview modal"
      >
        <iframe
          srcDoc={cratePreview}
          title="RO-Crate Preview"
          width="100%"
          height="100%"
        />
      </EMGModal>
    </>
  );
};

export default ROCratePreview;
