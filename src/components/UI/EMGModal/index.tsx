import React, { ReactChild, ReactChildren } from 'react';

import Modal from 'react-modal';

import './style.css';
import roCrateSingleton from 'utils/roCrateSingleton';

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
  isOpen: boolean;
  onRequestClose: () => void;
  contentLabel: string;
  children: ReactChild | ReactChild[] | ReactChildren | ReactChildren[];
  iframeRef?: React.RefObject<HTMLIFrameElement>;
  crateUrl?: string;
};
const EMGModal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  contentLabel,
  children,
  iframeRef,
  crateUrl,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={contentLabel}
      style={modalStyle}
      onAfterOpen={() => {
        if (iframeRef && iframeRef.current) {
          iframeRef.current.contentWindow.document.addEventListener(
            'DOMContentLoaded',
            (event) => {
              alert('doc loaded');
              const iframePage2Anchor =
                iframeRef.current.contentWindow.document.getElementById(
                  'page2Anchor'
                );
              iframePage2Anchor.addEventListener('click', (e) => {
                e.preventDefault();
                roCrateSingleton
                  .getPage2Html(crateUrl, 'motus')
                  .then((page2Html) => {
                    // eslint-disable-next-line no-param-reassign
                    iframeRef.current.contentDocument.body.innerHTML =
                      page2Html;
                  });
              });
            }
          );
        }
      }}
    >
      <div className="emg-modal-close">
        <button
          onClick={onRequestClose}
          className="vf-button vf-button--link"
          type="button"
        >
          <i className="icon icon-common icon-times" />
        </button>
      </div>
      {children}
    </Modal>
  );
};

export default EMGModal;
