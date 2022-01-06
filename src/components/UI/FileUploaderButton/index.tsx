import React, { useRef, FormEvent } from 'react';

type FileUploaderButtonProps = {
  onChange: (event: FormEvent) => void;
  accept?: string;
};
const FileUploaderButton: React.FC<FileUploaderButtonProps> = ({
  onChange,
  accept,
}) => {
  const fileInput = useRef(null);
  return (
    <>
      <input
        type="file"
        hidden
        ref={fileInput}
        onChange={onChange}
        accept={accept}
      />
      <button
        className="vf-button vf-button--primary vf-button--sm"
        onClick={() => fileInput.current?.click()}
        type="button"
      >
        Browse for file...
      </button>
    </>
  );
};

export default FileUploaderButton;
