import React from 'react';

import './style.css';

type ExtLinkProps = {
  href: string;
  title?: string;
  id?: string;
};
const ExtLink: React.FC<ExtLinkProps> = ({ href, id, title, children }) => (
  <a
    href={href}
    title={title}
    id={id}
    target="_blank"
    rel="noreferrer noopener"
    className="mg-ext"
  >
    <span className="icon icon-common icon-external-link-alt" /> {children}
  </a>
);

export default ExtLink;
