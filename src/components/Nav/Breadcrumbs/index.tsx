import React from 'react';

const Breadcrumbs = ({ links }) => {
  let index;
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
            }
            // index: React.Key
          ) => (
            <li className="vf-breadcrumbs__item">
              {
                //   check for last link
                index === links.length - 1 ? (
                  <span className="vf-breadcrumbs__item vf-breadcrumbs__item--current">
                    {link.label}
                  </span>
                ) : (
                  <a
                    className="vf-breadcrumbs__item"
                    href={link.url}
                    key={index}
                  >
                    {link.label}
                  </a>
                )
              }
            </li>
          )
        )}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
