import React, { useEffect, useState } from 'react';
import EMGModal from 'components/UI/EMGModal';
import JSZip from 'jszip';
import { ROCrate } from 'ro-crate/index';

type ROCratePreviewProps = {
  crateUrl: string;
  // trackView: any;
};

const ROCratePreview: React.FC<ROCratePreviewProps> = ({ crateUrl }) => {
  const [cratePreview, setCratePreview] = useState('');
  const [crateModalOpen, setCrateModalOpen] = useState(false);
  const [trackView, setTrackView] = useState<any>(null);

  useEffect(() => {
    fetch(crateUrl as string, { method: 'GET' })
      .then((response) => {
        if (response.status === 200 || response.status === 0) {
          return Promise.resolve(response.blob());
        }
        return Promise.reject(new Error(response.statusText));
      })
      .then(JSZip.loadAsync)
      .then(async (crateZip) => {
        const metadataJson = await crateZip
          .file('ro-crate-metadata.json')
          .async('string');

        const metadata = JSON.parse(metadataJson);
        const crate = new ROCrate(metadata, {
          link: true,
          array: true,
        });
        const tree = crate.getNormalizedTree();
        let filePointer;
        tree.hasPart.forEach((dataset) => {
          if (
            dataset['@type'].includes('File') &&
            dataset.encodingFormat[0]['@value'].includes('gff')
          ) {
            filePointer = dataset['@id'];
          }
        });
        const name = tree.name[0]['@value'].split(' ')[0];
        const gff = await crateZip.file(filePointer).async('base64');
        const trackViewOptions = {
          name,
          type: 'annotation',
          format: 'gff3',
          displayMode: 'EXPANDED',
          url: `data:application/octet-stream;base64,${gff}`,
          label: name,
          crate: {
            tree,
            zip: crateZip,
          },
        };
        setTrackView(trackViewOptions);
        if (trackViewOptions.crate) {
          trackViewOptions.crate.zip
            .file('ro-crate-preview.html')
            .async('string')
            .then(setCratePreview);
        }
      });
  }, [crateUrl]);

  // if (!cratePreview.length) {
  //   return null;
  // }

  return (
    <>
      <span className="vf-text-body vf-text-body--4">
        <button
          className="vf-button vf-button--link mg-button-as-link"
          onClick={() => setCrateModalOpen(true)}
          type="button"
        >
          Browse the RO-Crate
        </button>{' '}
        providing this track
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
