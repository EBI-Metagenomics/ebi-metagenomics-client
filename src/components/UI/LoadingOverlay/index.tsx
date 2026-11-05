import React from 'react';

import './style.css';

type LoadingOverlayProps = {
  loading: boolean;
};
const LoadingOverlay: React.FC<
  React.PropsWithChildren<LoadingOverlayProps>
> = ({ loading, children }) => (
  <div className="mg-loading-overlay-container">
    <div className={loading ? 'mg-loading-overlay' : undefined} />
    {children}
  </div>
);

export default LoadingOverlay;
