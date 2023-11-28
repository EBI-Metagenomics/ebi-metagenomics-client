import React from 'react';

const Breadcrumbs = ({ links }) => {
  return (
    <nav className="vf-breadcrumbs" aria-label="Breadcrumb">
      <ul className="vf-breadcrumbs__list | vf-list vf-list--inline">
        {links.map(
          (
            link: {
              url: string;
              label:
                | boolean
                | React.ReactChild
                | React.ReactFragment
                | React.ReactPortal;
              index: React.Key;
            },
            index: React.Key
          ) => (
            <li className="vf-breadcrumbs__item">
              {/* <h1>{link.url}</h1> */}
              {index === links.length - 1 ? (
                <span className="vf-breadcrumbs__item vf-breadcrumbs__item--current">
                  {link.label}
                </span>
              ) : (
                <a
                  className="vf-breadcrumbs__item"
                  href={`/metagenomics${link.url}`}
                  key={index}
                >
                  {link.label}
                </a>
              )}
            </li>
          )
        )}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
