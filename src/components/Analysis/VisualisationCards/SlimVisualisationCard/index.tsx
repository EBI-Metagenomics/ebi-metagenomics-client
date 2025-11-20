import React, { useState, useEffect, useRef } from 'react';
import Tooltip from 'components/UI/Tooltip';

interface SlimVisualisationCardProps {
  children?: React.ReactNode;
  onDownload?: () => void;
  onCopy?: () => void;
  fileData: {
    alias: string;
    downloadType: string;
    fileType: string;
    longDescription: string;
    shortDescription: string;
    download_group?: string;
    url: string;
  };
}

const SlimVisualisationCard: React.FC<SlimVisualisationCardProps> = ({
  children,
  onDownload,
  onCopy,
  fileData,
}) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const {
    alias,
    downloadType,
    fileType,
    longDescription,
    shortDescription,
    url,
  } = fileData;
  const urlRef = useRef<HTMLAnchorElement>(null);
  const [, setIsUrlTruncated] = useState(false);
  useEffect(() => {
    if (urlRef.current) {
      setIsUrlTruncated(
        urlRef.current.offsetWidth < urlRef.current.scrollWidth
      );
    }
    // enhanceUrlDisplay();
  }, [url]);

  const handleDownload = () => {
    if (url) {
      window.open(url, '_blank');
    }
    if (onDownload) {
      onDownload();
    }
  };

  const handleCopy = () => {
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000);
      });
    }
    if (onCopy) {
      onCopy();
    }
  };

  const getFileTypeColors = (_fileType: string) => {
    switch (_fileType?.toLowerCase()) {
      case 'tsv':
        return { bg: '#e9f7fe', color: '#0288d1' };
      case 'mseq':
        return { bg: '#f0f4ff', color: '#3f51b5' };
      case 'fastq':
        return { bg: '#fdf7e2', color: '#cc9933' };
      case 'fasta':
        return { bg: '#e8f5e9', color: '#43a047' };
      default:
        return { bg: '#f5f5f5', color: '#757575' };
    }
  };

  const fileTypeColors = getFileTypeColors(fileType);

  return (
    <>
      <article
        className="vf-card vf-card--brand vf-card--bordered slim-card"
        style={{
          position: 'relative',
          padding: '20px',
          borderRadius: '8px',
          borderTop: `4px solid ${fileTypeColors.color}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div className="slim-card-header">
          <div className="file-info">
            {/* File name with type badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <div
                className="file-icon"
                style={{
                  backgroundColor: fileTypeColors.bg,
                  color: fileTypeColors.color,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  marginRight: '8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: '4px' }}
                >
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071
                    4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304
                    4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957
                    22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke={fileTypeColors.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {fileType}
              </div>

              <h3
                className="file-name"
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  margin: '0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '300px',
                }}
              >
                {alias}
              </h3>
            </div>

            {/* Download type badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <span
                style={{
                  backgroundColor: '#f0f0f0',
                  color: '#555',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'inline-block',
                }}
              >
                {downloadType}
              </span>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: '14px',
                margin: '0 0 6px 0',
                color: '#333',
              }}
            >
              <strong>{shortDescription}</strong>
            </p>
            <p
              style={{
                fontSize: '13px',
                margin: '0',
                color: '#666',
                lineHeight: '1.4',
              }}
            >
              {longDescription}
            </p>
          </div>

          {/* Action buttons */}
          <div
            className="card-actions"
            style={{
              display: 'flex',
              gap: '10px',
              flexShrink: 0,
            }}
          >
            <Tooltip content="Download">
              {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
              <button
                type="submit"
                onClick={handleDownload}
                className="action-button"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: fileTypeColors.bg,
                  border: `1px solid ${fileTypeColors.color}40`,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = fileTypeColors.bg;
                  e.currentTarget.style.borderColor = fileTypeColors.color;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 3px 6px ${fileTypeColors.color}25`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = fileTypeColors.bg;
                  e.currentTarget.style.borderColor = `${fileTypeColors.color}40`;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 1px 3px rgba(0, 0, 0, 0.08)';
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 15V19C21 19.5304 20.7893 20.0391
                    20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957
                    21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                    stroke={fileTypeColors.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 10L12 15L17 10"
                    stroke={fileTypeColors.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 15V3"
                    stroke={fileTypeColors.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Tooltip>

            <Tooltip content="Copy link">
              {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
              <button
                type="button"
                onClick={handleCopy}
                className={`action-button ${showCopiedMessage ? 'copied' : ''}`}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: showCopiedMessage ? '#edf8ed' : '#f8f8f8',
                  border: showCopiedMessage
                    ? '1px solid #7ac47a'
                    : '1px solid #e4e4e4',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = showCopiedMessage
                    ? '#d4edda'
                    : '#edf4f7';
                  e.currentTarget.style.borderColor = showCopiedMessage
                    ? '#28a745'
                    : '#3B6FB6';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = showCopiedMessage
                    ? '0 2px 5px rgba(40, 167, 69, 0.15)'
                    : '0 2px 5px rgba(59, 111, 182, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = showCopiedMessage
                    ? '#edf8ed'
                    : '#f8f8f8';
                  e.currentTarget.style.borderColor = showCopiedMessage
                    ? '#7ac47a'
                    : '#e4e4e4';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 1px 3px rgba(0, 0, 0, 0.08)';
                }}
              >
                {showCopiedMessage ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="#28a745"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046
                      9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z"
                      stroke="#333333"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 15H4C3.46957 15 2.96086
                      14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957
                      2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957
                      2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5"
                      stroke="#333333"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                {showCopiedMessage && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(40, 167, 69, 0.9)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      animation: 'fadeInOut 2s ease',
                      zIndex: 20,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Copied!
                  </div>
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* URL link with improved styling for truncation */}
        <div className="url-link-container" title={url}>
          <div data-full-url={url}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              ref={urlRef}
            >
              {url}
            </a>
          </div>
        </div>

        {/* Content area if any additional content is provided */}
        {children && <div className="slim-card-content">{children}</div>}

        <style>
          {`
          @keyframes fadeInOut {
            0% { opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { opacity: 0; }
          }
          
          /* URL link container */
          .url-link-container {
            background-color: #f8f8f8;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 12px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            font-size: 12px;
            border: 1px solid #e4e4e4;
            position: relative;
            overflow: hidden;
          }
          
          .url-link-container::before {
            content: 'URL';
            position: absolute;
            top: -8px;
            left: 12px;
            background-color: #f0f0f0;
            padding: 0 6px;
            font-size: 10px;
            color: #666;
            border-radius: 3px;
          }
          
          .url-link-container a {
            color: #3B6FB6;
            text-decoration: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
            width: 100%;
          }
          
          /* Gradient fade for truncated URL */
          .url-truncated::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            height: 100%;
            width: 40px;
            background: linear-gradient(to right, rgba(248, 248, 248, 0), rgba(248, 248, 248, 1) 70%);
            pointer-events: none;
          }
          
          /* Tooltip for showing full URL on hover */
        `}
        </style>
      </article>
      <br />
    </>
  );
};

export default SlimVisualisationCard;
