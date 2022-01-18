import React, { useLayoutEffect, useRef, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserContext from 'pages/Login/UserContext';

import MGnifyLogo from 'images/mgnify_logo_reverse.svg';

import './style.css';
import ExtLink from 'src/components/UI/ExtLink';

const pages: Array<{ label: string; path?: string; href?: string }> = [
  { label: 'Overview', path: '/' },
  { label: 'Submit data', path: '/submit' },
  { label: 'Text search', path: '/search' },
  { label: 'Sequence search' },
  { label: 'Browse data', path: '/browse' },
  { label: 'API' },
  { label: 'About', path: '/about' },
  { label: 'Help', path: '/help' },
  { label: 'Login', path: '/login' },
];

const START_POS = 100;
const START_MARGIN = -7;

const MainMenu: React.FC = () => {
  const location = useLocation();
  const imgRef = useRef(null);
  const { isAuthenticated, config } = useContext(UserContext);
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
  // Getting link to Mgnify Hmmer from the config
  pages[3].href = config.hmmer;
  // Getting link to API from the config
  pages[5].href = config.api;
  return (
    <div className="mg-main-menu vf-u-fullbleed">
      <img
        src={MGnifyLogo}
        alt="MGnify Logo"
        className="mg-logo-sticky"
        style={{
          marginLeft: animationState.marginLeft,
          opacity: animationState.opacity,
        }}
        ref={imgRef}
      />

      <nav className="vf-navigation vf-navigation--main | vf-cluster vf-u-fullbleed">
        <ul className="vf-navigation__list | vf-list | vf-cluster__inner">
          {pages
            // .filter(({ label }) => !isAuthenticated || label !== 'Login')
            .map(({ label, path, href }) => (
              <li className="vf-navigation__item" key={path}>
                {path && (
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
                    {isAuthenticated && label === 'Login' ? 'Logout' : label}
                  </Link>
                )}
                {!path && href && (
                  <ExtLink href={href} className="vf-navigation__link">
                    {label}
                  </ExtLink>
                )}
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
};

export default MainMenu;
