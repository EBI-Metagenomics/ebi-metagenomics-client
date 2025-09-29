import React, { useRef, useState } from 'react';
import Modal from 'react-modal';
import './style.css';
import { useCrate } from '@/hooks/genomeViewer/CrateStore/useCrates';

Modal.setAppElement('#root');

const modalStyle = {
  overlay: {
    zIndex: 2000,
    position: 'fixed',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: 'calc(100vh - 5em)',
    overflowY: 'auto',
    width: '80vw',
    height: '80vh',
  },
};

type ModalProps = {
  crateUrl: string;
  useButtonVariant?: boolean;
};

const ROCrateBrowser: React.FC<ModalProps> = ({
  crateUrl,
  useButtonVariant,
}) => {
  const [cratePreview, setCratePreview] = useState<string>();
  const [crateModalOpen, setCrateModalOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const crate = useCrate(crateUrl);

  async function handleButtonClick() {
    crate?.getHtmlContent?.().then((previewHtml) => {
      setCratePreview(previewHtml);
      setCrateModalOpen(true);
    });
  }

  const handleIframeMessage = async (event: MessageEvent) => {
    if (typeof event.data !== 'string') {
      return;
    }
    if (
      // TODO: generalize with a custom event name
      !event.data.includes('multiqc') &&
      !event.data.includes('krona') &&
      !event.data.includes('ro-crate-preview')
    ) {
      return;
    }
    crate?.getHtmlContent?.(event.data).then((htmlContent) => {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = htmlContent ?? '';
      }
    });
  };
  return (
    <>
      <span className="vf-text-body vf-text-body--4">
        <button
          className={`ro-crate-browser-button vf-button ${
            useButtonVariant
              ? 'vf-button--sm vf-button--secondary'
              : 'vf-button--link mg-button-as-link'
          }`}
          onClick={handleButtonClick}
          type="button"
        >
          Browse the RO-Crate
        </button>
        {!useButtonVariant && <span> providing this track</span>}
      </span>
      <Modal
        isOpen={crateModalOpen}
        onRequestClose={() => {
          window.removeEventListener('message', handleIframeMessage);
          setCrateModalOpen(false);
        }}
        // @ts-ignore todo why?
        style={modalStyle}
        onAfterOpen={() => {
          window.addEventListener('message', handleIframeMessage);
        }}
        contentLabel="RO-Crate preview modal"
      >
        <div className="emg-modal-close">
          <button
            onClick={() => {
              window.removeEventListener('message', handleIframeMessage);
              setCrateModalOpen(false);
            }}
            className="modal-close-button vf-button vf-button--link"
            type="button"
          >
            <i className="icon icon-common icon-times" />
          </button>
        </div>
        <iframe
          ref={iframeRef}
          srcDoc={cratePreview}
          title="RO-Crate Preview"
          width="100%"
          height="100%"
        />
      </Modal>
    </>
  );
};

export default ROCrateBrowser;
