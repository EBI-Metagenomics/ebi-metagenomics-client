import React, { useRef, useState } from 'react';
import Modal from 'react-modal';
import './style.css';
import RoCrateSingleton from 'utils/roCrateSingleton';

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
  crateUrl?: string;
  specificCrateFolder?: string;
  useButtonVariant?: boolean;
};

const ROCrateBrowser: React.FC<ModalProps> = ({
  crateUrl,
  specificCrateFolder,
  useButtonVariant,
}) => {
  const [cratePreview, setCratePreview] = useState('');
  const [crateModalOpen, setCrateModalOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const checkIfLinkisRelative = (link: string) => {
    return link.startsWith('http');
  };

  function handleButtonClick() {
    RoCrateSingleton.getHtmlContent('ro-crate-preview.html', crateUrl).then(
      (previewHtml) => {
        setCratePreview(previewHtml);
        setCrateModalOpen(true);
      }
    );
  }

  const handleIframeMessage = (event: MessageEvent) => {
    if (typeof event.data !== 'string') {
      return;
    }
    if (
      !event.data.includes('multiqc') &&
      !event.data.includes('krona') &&
      !event.data.includes('ro-crate-preview')
    ) {
      return;
    }
    RoCrateSingleton.getHtmlContent(event.data, crateUrl).then(
      (htmlContent) => {
        if (iframeRef.current) {
          iframeRef.current.srcdoc = htmlContent;
        }
      }
    );
  };

  return (
    <>
      <span className="vf-text-body vf-text-body--4">
        <button
          className={`vf-button ${
            useButtonVariant
              ? 'vf-button--sm vf-button--secondary'
              : 'vf-button--link mg-button-as-link'
          }`}
          onClick={() => handleButtonClick()}
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
            className="vf-button vf-button--link"
            type="button"
          >
            <i className="icon icon-common icon-times" />
          </button>
        </div>
        <iframe
          ref={iframeRef}
          id="iframe"
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
