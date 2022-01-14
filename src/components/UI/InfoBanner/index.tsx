import React from 'react';

type InfoBannerProps = {
  type?: 'info' | 'warning' | 'error';
  title?: string;
};
const InfoBanner: React.FC<InfoBannerProps> = ({ type, title, children }) => {
  return (
    <div
      className={`vf-banner vf-banner--alert ${
        ['warning', 'error'].includes(type)
          ? 'vf-banner--warning'
          : 'vf-banner--info'
      }`}
    >
      {(title || type) && (
        <h3 className="vf-box__heading">
          {type === 'info' && <span className="icon icon-common icon-info" />}
          {type === 'error' && <span className="icon icon-common icon-bolt" />}
          {type === 'warning' && (
            <span className="icon icon-common icon-exclamation-triangle" />
          )}{' '}
          {title || ''}
        </h3>
      )}
      <div className="vf-banner__content">{children}</div>
    </div>
  );
};

export default InfoBanner;
