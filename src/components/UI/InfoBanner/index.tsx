import React from 'react';

type InfoBannerProps = {
  type?: 'info' | 'warning' | 'error';
  title?: string;
};
const InfoBanner: React.FC<InfoBannerProps> = ({ type, title, children }) => {
  return (
    <div
      className={`vf-banner vf-banner--alert ${
        ['warning', 'error'].includes(type as string)
          ? 'vf-banner--warning'
          : 'vf-banner--info'
      }`}
    >
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
      </div>
      <div className="vf-banner__content">{children}</div>
    </div>
  );
};

export default InfoBanner;
