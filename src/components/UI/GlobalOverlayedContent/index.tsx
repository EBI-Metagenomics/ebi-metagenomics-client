/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import './style.css';

type OverlayedProps = {
  show: boolean;
  setShowModal: (boolean) => void;
};

const OverlayedContent: React.FC<OverlayedProps> = ({
  show,
  setShowModal,
  children,
}) => {
  const close = (): void => setShowModal(false);
  return (
    <>
      <div
        role="dialog"
        className={show ? 'mg-overlay' : undefined}
        onClick={close}
      />
      {show && (
        <button
          type="button"
          onClick={close}
          className="vf-button vf-button--link mg-button-as-link mg-overlay-close"
        >
          X
        </button>
      )}
      {show && <div className="mg-overlay-content">{children}</div>}
    </>
  );
};

export default OverlayedContent;
