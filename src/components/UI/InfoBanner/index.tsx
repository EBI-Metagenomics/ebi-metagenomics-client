import React from 'react';

const InfoBanner: React.FC /* <{ Content: string | React.ElementType }> */ = ({
  // Content,
  children,
}) => {
  return (
    <div className="vf-banner vf-banner--alert vf-banner--info">
      <div className="vf-banner__content">
        {/* {Content &&
          (typeof Content === 'string' ? (
            <p className="vf-banner__text">Content</p>
          ) : (
            <Content />
          ))} */}
        {children}
      </div>
    </div>
  );
};

export default InfoBanner;
