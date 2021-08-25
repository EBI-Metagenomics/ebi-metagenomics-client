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
  return (
    <>
      <div
        className={show ? 'mg-overlay' : undefined}
        onClick={() => setShowModal(false)}
      />
      {show && <div className="mg-overlay-content">{children}</div>}
    </>
  );
};

export default OverlayedContent;
