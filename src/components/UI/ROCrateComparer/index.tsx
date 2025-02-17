import React from 'react';
import { useOfflineCrate } from 'hooks/genomeViewer/CrateStore/useCrates';

const ROCrateComparer = () => {
  const { crate, uploadCrate, isUploading, removeCrate } = useOfflineCrate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadCrate(file);
    }
  };

  const handleButtonClick = () => {
    document.getElementById('fileInput').click();
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        id="fileInput"
        style={{ display: 'none' }}
      />
      <div className="vf-stack vf-stack--200">
        <p className="vf-form__label">Compare another track</p>
        <div>
          {!crate && (
            <button
              onClick={handleButtonClick}
              className="vf-button vf-button--sm"
              type="button"
              disabled={isUploading}
            >
              {isUploading ? 'Adding...' : 'Add offline RO-Crate'}
            </button>
          )}
          {!!crate && (
            <button
              className="vf-button vf-button--sm vf-button--link"
              type="button"
              onClick={removeCrate}
            >
              Clear offline RO-Crate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ROCrateComparer;
