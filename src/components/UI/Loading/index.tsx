import React from 'react';
import './style.css';

const Loading: React.FC<{ size?: 'small' | 'large' }> = ({ size = '' }) => (
  <div className="mg-loading">
    <div className={`mg-loading-spinner ${size}`} />
    <div className={`mg-loading-spinner-2 ${size}`} />
  </div>
);

export default Loading;
