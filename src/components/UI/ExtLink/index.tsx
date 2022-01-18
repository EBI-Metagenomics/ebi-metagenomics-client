import React from 'react';

import './style.css';

type ExtLinkProps = {
  href: string;
  title?: string;
  id?: string;
  className?: string;
};
const ExtLink: React.FC<ExtLinkProps> = ({
  href,
  id,
  title,
  className = '',
  children,
}) => (
  <a
    href={href}
    title={title}
    id={id}
    target="_blank"
    rel="noreferrer noopener"
    className={`mg-ext ${className}`}
  >
    <span className="icon icon-common icon-external-link-alt" /> {children}
  </a>
);

export default ExtLink;
