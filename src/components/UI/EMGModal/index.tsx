import React, { ReactChild, ReactChildren } from 'react';
import type * as CSS from 'csstype';

import Modal from 'react-modal';

import './style.css';

Modal.setAppElement('#root');

const modalStyle = {
  overlay: {
    zIndex: 2000,
    position: 'fixed' as CSS.Property.Position,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    overflowY: 'auto' as CSS.Property.OverflowY,
    maxHeight: 'calc(100vh - 5em)',
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
