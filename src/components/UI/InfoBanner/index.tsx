import React from 'react';

type InfoBannerProps = {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  dismissAriaLabel?: string;
};
const InfoBanner: React.FC<InfoBannerProps> = ({
  type,
  title,
  children,
  dismissible = false,
  onDismiss,
  dismissAriaLabel,
}) => {
  const [visible, setVisible] = React.useState(true);
  // in case type is undefined, default it to info
  type = type || 'info';
  const bannerTypes = {
    info: 'vf-banner-info',
    success: 'vf-banner--success',
    warning: 'vf-banner--warning',
    error: 'vf-banner--error',
  };
  const selectedBannerType = bannerTypes[type];
  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };
  if (!visible) return null;
  return (
    <div className={`vf-banner vf-banner--alert ${selectedBannerType}`}>
      <div className="vf-banner__content">
        {(title || type) && (
          <h4 className="vf-box__heading vf-text-heading--5">
            {type === 'info' && <span className="icon icon-common icon-info" />}
            {type === 'error' && (
              <span className="icon icon-common icon-bolt" />
            )}
            {type === 'warning' && (
              <span className="icon icon-common icon-exclamation-triangle" />
            )}{' '}
            {title || ''}
          </h4>
        )}
        {children}
        {dismissible && (
          <button
            type="button"
            role="button"
            aria-label={dismissAriaLabel || 'close notification banner'}
            className="vf-button vf-button--icon vf-button--dismiss | vf-banner__button"
            onClick={handleDismiss}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <title>dismiss banner</title>
              <path d="M14.3,12.179a.25.25,0,0,1,0-.354l9.263-9.262A1.5,1.5,0,0,0,21.439.442L12.177,9.7a.25.25,0,0,1-.354,0L2.561.442A1.5,1.5,0,0,0,.439,2.563L9.7,11.825a.25.25,0,0,1,0,.354L.439,21.442a1.5,1.5,0,0,0,2.122,2.121L11.823,14.3a.25.25,0,0,1,.354,0l9.262,9.263a1.5,1.5,0,0,0,2.122-2.121Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default InfoBanner;
