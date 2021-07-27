import React from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import './style.css';

type SomeComponentProps = RouteComponentProps;

const pages = [
  { label: 'Overview', path: '/' },
  // { label: 'Submit data', path: '/submit' },
  { label: 'Text search', path: '/search' },
  { label: 'Sequence search', path: '/sequence-search' },
  // { label: 'Browse data', path: '' },
  // { label: 'Genomes', path: '' },
  // { label: 'API', path: '' },
  { label: 'About', path: '/about' },
  { label: 'Help', path: '/help' },
  // { label: 'Login', path: '' },
];
const MainMenu: React.FC<SomeComponentProps> = ({ location }) => {
  return (
    // eslint-disable-next-line max-len
    <nav className="vf-navigation vf-navigation--main | vf-cluster mg-main-menu vf-u-fullbleed">
      <ul className="vf-navigation__list | vf-list | vf-cluster__inner">
        {pages.map(({ label, path }) => (
          <li className="vf-navigation__item" key={path}>
            <Link
              className="vf-navigation__link"
              aria-current={location.pathname === path ? 'page' : undefined}
              to={path}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default withRouter(MainMenu);
