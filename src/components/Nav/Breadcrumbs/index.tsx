import React, { useEffect } from 'react';
import { last } from 'lodash-es';

type Breadcrumb = {
  url?: string;
  label: string;
};

type BreadcrumbsProps = {
  links: Breadcrumb[];
  setTitle?: boolean;
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  links,
  setTitle = true,
}) => {
  useEffect(() => {
    if (setTitle) {
      document.title = `MGnify (EBI) ${last(links)?.label}`;
    }
    return () => {
      document.title = 'MGnify (EBI)';
    };
  }, [links, setTitle]);

  return (
    <nav className="vf-breadcrumbs" aria-label="Breadcrumb">
      <ul className="vf-breadcrumbs__list | vf-list vf-list--inline">
        {links.map((link: Breadcrumb, index: number) => (
          <li className="vf-breadcrumbs__item" key={link.label}>
            {index === links.length - 1 ? (
              <span className="vf-breadcrumbs__item vf-breadcrumbs__item--current">
                {link.label}
              </span>
            ) : (
              <a
                className="vf-breadcrumbs__item"
                href={`/metagenomics${link.url}`}
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
