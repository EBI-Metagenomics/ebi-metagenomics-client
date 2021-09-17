import React from 'react';

const Box: React.FC<{ label: string; theme?: string }> = ({
  label,
  theme = 'primary',
  children,
}) => (
  <div className="vf-grid">
    <div className={`vf-box vf-box--easy vf-box-theme--${theme}`}>
      <h5 className="vf-box__heading">{label}</h5>
      <div className="vf-box__text">{children}</div>
    </div>
  </div>
);

export default Box;
