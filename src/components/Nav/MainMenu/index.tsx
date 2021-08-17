import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import MGnifyLogo from 'images/mgnify_logo_reverse.svg';

import './style.css';

type SomeComponentProps = RouteComponentProps;

const pages = [
  { label: 'Overview', path: '/' },
  // { label: 'Submit data', path: '/submit' },
  { label: 'Text search', path: '/search' },
  { label: 'Sequence search', path: '/sequence-search' },
  { label: 'Browse data', path: '/browse' },
  // { label: 'Genomes', path: '' },
  // { label: 'API', path: '' },
  { label: 'About', path: '/about' },
  { label: 'Help', path: '/help' },
  // { label: 'Login', path: '' },
];

const START_POS = 100;
const START_MARGIN = -8;

const MainMenu: React.FC<SomeComponentProps> = ({ location }) => {
  const imgRef = useRef(null);
  const [animationState, setAnimationState] = useState({
    marginLeft: `${START_MARGIN}rem`,
    opacity: 0,
  });
  useLayoutEffect(() => {
    const onScroll = (): void => {
      const topPos = imgRef.current.getBoundingClientRect().top;
      let newMargin = START_MARGIN;
      if (topPos < START_POS) {
        const m = (START_MARGIN - 1) / (START_POS - 0);
        const b = START_MARGIN - m * START_POS;
        newMargin = m * topPos + b;
      }
      setAnimationState({
        marginLeft: `${newMargin}rem`,
        opacity: 0.75 + newMargin / 8,
      });
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="mg-main-menu">
      <img
        src={MGnifyLogo}
        alt="MGnify Logo"
        style={{
          marginLeft: animationState.marginLeft,
          opacity: animationState.opacity,
        }}
        ref={imgRef}
      />

      <nav className="vf-navigation vf-navigation--main | vf-cluster vf-u-fullbleed">
        <ul className="vf-navigation__list | vf-list | vf-cluster__inner">
          {pages.map(({ label, path }) => (
            <li className="vf-navigation__item" key={path}>
              <Link
                className="vf-navigation__link"
                aria-current={
                  (path === '/' && location.pathname === path) ||
                  (path !== '/' && location.pathname.startsWith(path))
                    ? 'page'
                    : undefined
                }
                to={path}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default withRouter(MainMenu);
