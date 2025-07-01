import React, {
  useLayoutEffect,
  useRef,
  useState,
  useContext,
  useEffect,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserContext from 'pages/Login/UserContext';

import MGnifyLogo from 'images/mgnify_logo_reverse.svg';

import './style.css';
import ExtLink from 'components/UI/ExtLink';
import { useMedia } from 'react-use';
import EMGModal from 'components/UI/EMGModal';
import useAuthTokenVerifier from 'hooks/authentication/useAuthTokenVerifier';
import MegaMenu from 'components/Nav/MegaMenu';

const pages: Array<{ label: string; path?: string; href?: string }> = [
  { label: 'Overview', path: '/' },
  // {
  //   label: 'Submit data',
  //   path: 'https://www.ebi.ac.uk/ena/submit/webin/accountInfo',
  // },
  // { label: 'Text search', path: '/search' },
  { label: 'Sequence search' },
  { label: 'Browse data', path: '/browse' },
  { label: 'API' },
  { label: 'About', path: '/about' },
  { label: 'Help', path: '/help' },
  { label: 'Login', path: '/login' },
];

const START_POS = 100;
const START_MARGIN = -7;

const Nav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useContext(UserContext);
  const verifyAuthToken = useAuthTokenVerifier();
  useEffect(() => {
    verifyAuthToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <nav className="vf-navigation vf-navigation--main | vf-cluster vf-u-fullbleed">
      <ul className="vf-navigation__list | vf-list | vf-cluster__inner">
        {(isAuthenticated
          ? [...pages, { label: 'My Data', path: '/mydata' }]
          : pages
        ).map(({ label, path, href }) => (
          <li className="vf-navigation__item" key={label}>
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
  );
};

const MobileNav: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const verifyAuthToken = useAuthTokenVerifier();
  useEffect(() => {
    verifyAuthToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <EMGModal
        isOpen={isMobileMenuOpen}
        onRequestClose={() => setIsMobileMenuOpen(false)}
        contentLabel="MGnify menu"
      >
        <Nav />
      </EMGModal>
      <button
        style={{ margin: 0 }}
        type="button"
        className="vf-button vf-button--link"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <i className="icon icon-common icon-bars" />
      </button>
    </div>
  );
};

const MainMenu: React.FC = () => {
  const imgRef = useRef(null);
  const { config } = useContext(UserContext);
  const isSmall = useMedia('(max-width: 768px)');
  const [animationState, setAnimationState] = useState({
    marginLeft: isSmall ? 0 : `${START_MARGIN}rem`,
    opacity: isSmall ? 1 : 0,
  });
  const verifyAuthToken = useAuthTokenVerifier();
  useEffect(() => {
    verifyAuthToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    const onScroll = (): void => {
      if (isSmall) return;
      const topPos = imgRef.current.getBoundingClientRect().top;
      let newMargin = START_MARGIN;
      if (topPos < START_POS) {
        const m = (START_MARGIN - 1) / START_POS;
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
  }, [isSmall]);
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
          display: isSmall ? 'block' : 'none',
        }}
        ref={imgRef}
      />
      {isSmall ? <MobileNav /> : <MegaMenu />}
    </div>
  );
};

export default MainMenu;
