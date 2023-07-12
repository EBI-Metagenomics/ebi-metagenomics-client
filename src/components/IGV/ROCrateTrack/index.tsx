import React, { useEffect, useState } from 'react';
import EMGModal from 'components/UI/EMGModal';
import JSZip from 'jszip';
import { ROCrate } from 'ro-crate/index';
import useROCrate from 'hooks/useROCrate';

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
  const [track, setTrack] = useState<any>(null);
  const [temp, setTemp] = useState('fff');
  const { getPreviewHtml } = useROCrate(crateUrl);

  function populateCratePreview() {
    getPreviewHtml().then((previewHtml) => {
      setCratePreview(previewHtml);
      setCrateModalOpen(true);
    });
  }

  // async function populateCratePreview() {
  //   try {
  //     const previewHtml = await getPreviewHtml();
  //     await setCratePreview(previewHtml);
  //     setCrateModalOpen(true);
  //   } catch (error) {
  //     // Handle any errors that occurred during the asynchronous operations
  //     console.error(error);
  //   }
  // }

  return (
    <>
      <span className="vf-text-body vf-text-body--4">
        {/*<button*/}
        {/*  className="vf-button vf-button--link mg-button-as-link"*/}
        {/*  // onClick={() => setCrateModalOpen(true)}*/}
        {/*  onClick={() => populateCratePreview()}*/}
        {/*  type="button"*/}
        {/*>*/}
        {/*  Browse the RO-Crate*/}
        {/*</button>{' '}*/}
        <button
          className={`vf-button ${
            useButtonVariant
              ? 'vf-button--secondary vf-button--sm'
              : 'vf-button--link mg-button-as-link'
          }`}
          // onClick={() => setCrateModalOpen(true)}
          onClick={() => populateCratePreview()}
          type="button"
        >
          Browse the RO-Crate
        </button>
        {/*providing this track*/}
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
