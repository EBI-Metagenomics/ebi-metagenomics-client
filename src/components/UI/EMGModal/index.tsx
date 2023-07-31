import React, { ReactChild, ReactChildren, useEffect, useRef } from 'react';

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
  iframeRef?: React.RefObject<HTMLIFrameElement>;
};
const EMGModal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  contentLabel,
  children,
  iframeRef,
}) => {
  // useEffect(() => {
  //   React.Children.forEach(children, (child) => {
  //     // Access the props of each child component
  //     if (React.isValidElement(child)) {
  //       console.log('child', child);
  //       console.log(child.props.srcDoc);
  //       // console.log(child.ref.current);
  //       // eslint-disable-next-line no-param-reassign
  //       // child.props.srcDoc = '<h1>Hello</h1>';
  //       // console.log(child['ref']);
  //     }
  //   });
  // }, [children]);

  // useEffect(() => {
  //   // const iframe = document.getElementById('iframe');
  //   console.log(children);
  //   const newObj = children;
  //   console.log(newObj.props);
  //   // if (iframe) {
  //   //   console.log(iframe);
  //   // }
  // }, [children]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={contentLabel}
      style={modalStyle}
      onAfterOpen={() => {
        if (iframeRef && iframeRef.current) {
          // console.log('iframeRef', iframeRef);
          // console.log('iframeRef.current', iframeRef.current);
          // console.log(
          //   'iframeRef.current.contentWindow',
          //   iframeRef.current.contentWindow
          // );
          // console.log(
          //   'iframeRef.current.contentWindow.document',
          //   iframeRef.current.contentWindow.document
          // );
          // console.log(
          //   'iframeRef.current.contentWindow.document.body',
          //   iframeRef.current.contentWindow.document.body
          // );
          // console.log(
          //   'iframeRef.current.contentWindow.document.body.innerHTML',
          //   iframeRef.current.contentWindow.document.body.innerHTML
          // );

          // eslint-disable-next-line no-param-reassign
          iframeRef.current.contentWindow.document.onload = () => {
            const iframePage2Anchor =
              iframeRef.current.contentWindow.document.getElementById(
                'page2Anchor'
              );
            iframePage2Anchor.addEventListener('click', (e) => {
              e.preventDefault();
              alert('iframePage2Anchor clicked');
            });
          };
          console.log('current doc', document);
          console.log(iframeRef.current.contentWindow.document);
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
