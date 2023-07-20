import React, { useState } from 'react';
import EMGModal from 'components/UI/EMGModal';
import RoCrateSingleton from 'utils/roCrateSingleton';

type ROCratePreviewProps = {
  crateUrl: string;
  useButtonVariant?: boolean;
};

const ROCratePreview: React.FC<ROCratePreviewProps> = ({
  crateUrl,
  useButtonVariant,
}) => {
  const [cratePreview, setCratePreview] = useState('');
  const [crateModalOpen, setCrateModalOpen] = useState(false);

  function populateCratePreview() {
    RoCrateSingleton.getPreviewHtml(crateUrl).then((previewHtml) => {
      setCratePreview(previewHtml);
      setCrateModalOpen(true);
    });
  }

  return (
    <>
      <span className="vf-text-body vf-text-body--4">
        <button
          className={`vf-button ${
            useButtonVariant
              ? 'vf-button--sm vf-button--secondary'
              : 'vf-button--link mg-button-as-link'
          }`}
          onClick={() => populateCratePreview()}
          type="button"
        >
          Browse the RO-Crate
        </button>
        {!useButtonVariant && <span> providing this track</span>}
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
