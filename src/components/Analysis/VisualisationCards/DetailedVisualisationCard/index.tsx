import React, { useState } from 'react';
import EMGModal from 'components/UI/EMGModal';
import Tooltip from 'components/UI/Tooltip';

interface VisualisationCardProps {
  title?: string;
  subheading?: string;
  children: React.ReactNode;
  onSearch?: () => void;
  onDownload?: () => void;
  onCopy?: () => void;
  ftpLink?: string;
  showZoomButton?: boolean;
  showDownloadButton?: boolean;
  showCopyButton?: boolean;
  onZoomClick?: () => void;
  onDownloadClick?: () => void;
  onCopyClick?: () => void;
}

const DetailedVisualisationCard: React.FC<VisualisationCardProps> = ({
  title = '',
  subheading = '',
  children,
  onSearch,
  onDownload,
  onCopy,
  ftpLink = '',
  showZoomButton = true,
  showDownloadButton = true,
  showCopyButton = true,
  onZoomClick,
  onDownloadClick,
  onCopyClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const defaultZoomHandler = () => {
    setIsModalOpen(true);
    if (onSearch) {
      onSearch();
    }
  };

  const defaultCopyHandler = () => {
    if (ftpLink) {
      navigator.clipboard
        .writeText(ftpLink)
        .then(() => {
          setShowCopiedMessage(true);
          setTimeout(() => setShowCopiedMessage(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy FTP link: ', err);
        });
    }
    if (onCopy) {
      onCopy();
    }
  };

  const handleZoom = onZoomClick || defaultZoomHandler;
  const handleCopy = onCopyClick || defaultCopyHandler;

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <article
        className="vf-card vf-card--brand vf-card--bordered"
        style={{ position: 'relative' }}
      >
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          {ftpLink && (
            <div
              className="ftp-link-container"
              style={{
                backgroundColor: '#f8f8f8',
                padding: '8px 12px',
                borderRadius: '4px',
                marginRight: '12px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                maxWidth: '250px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '13px',
                position: 'relative',
                border: '1px solid #e4e4e4',
              }}
            >
              <a
                href={ftpLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#3B6FB6',
                  textDecoration: 'none',
                }}
              >
                {ftpLink}
              </a>
              {showCopiedMessage && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-35px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(59, 111, 182, 0.9)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    animation: 'fadeInOut 2s ease',
                    zIndex: 20,
                  }}
                >
                  Copied!
                </div>
              )}
            </div>
          )}

          <div
            className="card-actions"
            style={{
              display: 'flex',
              gap: '12px',
            }}
          >
            {showZoomButton && (
              <Tooltip content="Zoom">
                {}
                <button
                  type="button"
                  onClick={handleZoom}
                  className="action-button"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#f8f8f8',
                    border: '1px solid #e4e4e4',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#edf4f7';
                    e.currentTarget.style.borderColor = '#3B6FB6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 8px rgba(59, 111, 182, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f8f8';
                    e.currentTarget.style.borderColor = '#e4e4e4';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 4px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z"
                      stroke="#3B6FB6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 15L21 21"
                      stroke="#3B6FB6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 7V13"
                      stroke="#333333"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 10H13"
                      stroke="#333333"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Tooltip>
            )}

            {showDownloadButton && (
              <Tooltip content="Download">
                {}
                <a
                  href={ftpLink}
                  download
                  onClick={(e) => {
                    if (onDownloadClick) {
                      e.preventDefault();
                      onDownloadClick();
                    } else if (onDownload) {
                      onDownload();
                    }
                  }}
                  className="action-button"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#f8f8f8',
                    border: '1px solid #e4e4e4',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#edf4f7';
                    e.currentTarget.style.borderColor = '#3B6FB6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 8px rgba(59, 111, 182, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f8f8';
                    e.currentTarget.style.borderColor = '#e4e4e4';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 4px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19
                      21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                      stroke="#333333"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 10L12 15L17 10"
                      stroke="#333333"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 15V3"
                      stroke="#333333"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </Tooltip>
            )}

            {showCopyButton && ftpLink && (
              <Tooltip content="Copy link">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`action-button ${
                    showCopiedMessage ? 'copied' : ''
                  }`}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: showCopiedMessage ? '#edf8ed' : '#f8f8f8',
                    border: showCopiedMessage
                      ? '1px solid #7ac47a'
                      : '1px solid #e4e4e4',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = showCopiedMessage
                      ? '#d4edda'
                      : '#edf4f7';
                    e.currentTarget.style.borderColor = showCopiedMessage
                      ? '#28a745'
                      : '#3B6FB6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = showCopiedMessage
                      ? '0 4px 8px rgba(40, 167, 69, 0.15)'
                      : '0 4px 8px rgba(59, 111, 182, 0.15)';
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
                      '0 2px 4px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {showCopiedMessage ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="#28a745"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22
                        22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z"
                        stroke="#333333"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2
                        13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304
                        2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5"
                        stroke="#333333"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="vf-card__content | vf-stack vf-stack--400">
          <h3 className="vf-card__heading"> {title} </h3>
          <p className="vf-card__subheading">{subheading}</p>
          <div className="vf-card__text">{children}</div>
        </div>

        <style>
          {`
            @keyframes fadeInOut {
              0% { opacity: 0; }
              15% { opacity: 1; }
              85% { opacity: 1; }
              100% { opacity: 0; }
            }
            
            /* EBI/MGnify Color Variables */
            :root {
              --vf-color-blue: #3B6FB6;
              --vf-color-blue-light: #edf4f7;
              --vf-color-gray-light: #f8f8f8;
              --vf-color-gray-border: #e4e4e4;
              --vf-color-success: #28a745;
              --vf-color-success-light: #edf8ed;
            }
          `}
        </style>
      </article>

      <br />

      <EMGModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Visualisation Zoomed View"
      >
        <div
          className="zoomed-content"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <style>
            {`
              .multiqc-iframe {
                width: 100%;
                height: 100%;
                min-height: 1500px;
                border: none;
                flex: 1;
              }
            `}
          </style>
          {children}
        </div>
      </EMGModal>
    </>
  );
};

export default DetailedVisualisationCard;
