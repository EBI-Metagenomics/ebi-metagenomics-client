import React, { useState, useRef, useEffect } from 'react';
import EMGModal from 'components/UI/EMGModal';
import RoCrateSingleton from 'utils/roCrateSingleton';

type ROCratePreviewProps = {
  crateUrl: string;
  useButtonVariant?: boolean;
  specificCrateFolder?: string;
};

const ROCratePreview: React.FC<ROCratePreviewProps> = ({
  crateUrl,
  useButtonVariant,
  specificCrateFolder,
}) => {
  const [cratePreview, setCratePreview] = useState('');
  const [crateModalOpen, setCrateModalOpen] = useState(false);
  const myIframe = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = myIframe.current as any;

    // Define the MutationObserver callback function
    const handleMutation = (mutationsList: MutationRecord[]) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const mutation of mutationsList) {
        console.log('mutation', mutation);
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'srcDoc'
        ) {
          console.log(
            'Location changed in iframe:',
            (mutation.target as any).srcDoc
          );
          // Perform any actions based on the location change here
        }
      }
    };

    // Create a MutationObserver instance
    const observer = new MutationObserver(handleMutation);
    console.log(observer);
    (window as any).observer = observer;

    // Observe the 'src' attribute of the iframe
    if (iframe) {
      observer.observe(iframe, {
        attributes: true,
        // attributeFilter: ['srcDoc'],
      });
    }
    // observer.observe(iframe, { attributes: true, attributeFilter: ['src'] });

    // Clean up the observer when the component is unmounted
    return () => observer.disconnect();
  }, [myIframe.current]);

  function populateCratePreview() {
    RoCrateSingleton.getPreviewHtml(crateUrl, specificCrateFolder).then(
      (previewHtml) => {
        setCratePreview(previewHtml);
        setCrateModalOpen(true);
      }
    );
  }

  // alert(crateUrl);

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
        iframeRef={myIframe}
      >
        <iframe
          id="iframe"
          ref={myIframe}
          srcDoc={`<!DOCTYPE html><html><head></head><body><a href="/fake.html" id="page2Anchor">HEllo</a></body></html>`}
          title="RO-Crate Preview"
          width="100%"
          height="100%"
        />
      </EMGModal>
    </>
  );
};

export default ROCratePreview;
