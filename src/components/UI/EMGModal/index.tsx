import React, { ReactChild, ReactChildren } from 'react';

import Modal from 'react-modal';

import './style.css';

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
};
const EMGModal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  contentLabel,
  children,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={contentLabel}
      style={modalStyle}
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
