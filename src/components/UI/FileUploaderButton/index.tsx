import React, { useRef, FormEvent } from 'react';

type FileUploaderButtonProps = {
  onChange: (event: FormEvent) => void;
  accept?: string;
  buttonClassName?: string;
};
const FileUploaderButton: React.FC<FileUploaderButtonProps> = ({
  onChange,
  accept,
  buttonClassName = 'vf-button--primary vf-button--sm',
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
        className={`vf-button ${buttonClassName}`}
        onClick={() => fileInput.current?.click()}
        type="button"
      >
        Browse for file...
      </button>
    </>
  );
};

export default FileUploaderButton;
