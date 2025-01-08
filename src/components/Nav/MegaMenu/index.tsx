import React, { useContext, useEffect, useRef, useState } from 'react';
import ArrowForLink from 'components/UI/ArrowForLink';
import Link from 'components/UI/Link';
import { getDetailOrSearchURLForQuery } from 'utils/accessions';
import { createParamFromURL } from 'hooks/queryParamState/QueryParamStore/queryParamReducer';
import useQueryParamsStore from 'hooks/queryParamState/QueryParamStore/useQueryParamsStore';
import { useNavigate } from 'react-router-dom';
import UserContext from 'pages/Login/UserContext';
import config from 'utils/config';

const MegaMenu: React.FC = () => {
  const { isAuthenticated } = useContext(UserContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { dispatch } = useQueryParamsStore();

  const navigate = useNavigate();

  const handleMenuItemClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    sectionId: string
  ) => {
    e.preventDefault();
    setMenuVisible(true);
    setActiveSection(sectionId);
  };

  const closeMegaMenu = () => {
    setMenuVisible(false);
    setActiveSection(null);
  };

  const searchBox = useRef<HTMLInputElement>();
  const [isAccessionLike, setIsAccessionLike] = useState(false);
  const [nextURL, setNextURL] = useState('/search/studies');

  const handleInput = () => {
    if (!searchBox.current) return;
    const accessionMatcherResults = getDetailOrSearchURLForQuery(
      searchBox.current.value.trim()
    );
    setNextURL(accessionMatcherResults.nextURL);
    setIsAccessionLike(accessionMatcherResults.isAccessionLike);
  };

  const setSearchQuery = (query: string) => {
    dispatch(
      createParamFromURL({
        name: 'query',
        value: query,
      })
    );
  };
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMegaMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMegaMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    // <div onMouseLeave={handleMouseLeave}>
    <div ref={menuRef}>
      <div
        id="mgnify-mega-menu"
        className="vf-global-header vf-mega-menu"
        role="menubar"
      >
        <nav className="vf-navigation | vf-cluster">
          <ul className="vf-navigation__list | vf-list | vf-cluster__inner">
            <li className="vf-navigation__item">
              <a
                className="vf-navigation__link vf-mega-menu__link"
                id="demo-topics-content-section"
                href="/metagenomics"
                onClick={() => setMenuVisible(false)}
              >
                Overview
              </a>
            </li>
            <li className="vf-navigation__item">
              <a
                id="submit-data-section"
                className={`vf-navigation__link vf-mega-menu__link vf-mega-menu__link--has-section ${
                  activeSection === 'submit-data-section' ? 'active' : ''
                }`}
                href="https://www.ebi.ac.uk/ena/submit/webin/accountInfo"
                onClick={(event) =>
                  handleMenuItemClick(event, 'submit-data-section')
                }
                rel="noreferrer"
              >
                Submit data
              </a>
            </li>
            <li className="vf-navigation__item">
              <a
                id="text-search-section"
                className={`vf-navigation__link vf-mega-menu__link vf-mega-menu__link--has-section ${
                  activeSection === 'text-search-section' ? 'active' : ''
                }`}
                href="/metagenomics/search"
                onClick={(event) =>
                  handleMenuItemClick(event, 'text-search-section')
                }
              >
                Text search
              </a>
            </li>
            <li className="vf-navigation__item">
              <a
                id="sequence-search-link"
                target="_blank"
                href="https://www.ebi.ac.uk/metagenomics/sequence-search/search/phmmer"
                className="vf-navigation__link vf-mega-menu__link"
                onClick={() => setMenuVisible(false)}
                rel="noreferrer"
              >
                Sequence search &nbsp;
                <span className="icon icon-common icon-external-link-alt" />
              </a>
            </li>
            <li className="vf-navigation__item">
              <a
                id="browse-section"
                className={`vf-navigation__link vf-mega-menu__link vf-mega-menu__link--has-section ${
                  activeSection === 'browse-section' ? 'active' : ''
                }`}
                href="/metagenomics/browse"
                onClick={(event) =>
                  handleMenuItemClick(event, 'browse-section')
                }
              >
                Browse data
              </a>
            </li>

            <li className="vf-navigation__item">
              <a
                id="about-link"
                className="vf-navigation__link vf-mega-menu__link"
                href="/metagenomics/about"
                onClick={() => setMenuVisible(false)}
              >
                About
              </a>
            </li>

            <li className="vf-navigation__item">
              <a
                id="help-section"
                className={`vf-navigation__link vf-mega-menu__link vf-mega-menu__link--has-section ${
                  activeSection === 'help-section' ? 'active' : ''
                }`}
                href="/metagenomics/help"
                onClick={(event) => handleMenuItemClick(event, 'help-section')}
              >
                Help
              </a>
            </li>

            {isAuthenticated ? (
              <li className="vf-navigation__item">
                <a
                  className={`vf-navigation__link vf-mega-menu__link vf-mega-menu__link--has-section ${
                    activeSection === 'login-section' ? 'active' : ''
                  }`}
                  id="login-section"
                  href="/metagenomics/mydata"
                  onClick={(event) =>
                    handleMenuItemClick(event, 'login-section')
                  }
                >
                  My data
                </a>
              </li>
            ) : (
              <li className="vf-navigation__item">
                <a
                  id="login-link"
                  className="vf-navigation__link vf-mega-menu__link"
                  href="/metagenomics/login"
                  onClick={() => setMenuVisible(false)}
                >
                  Login
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {menuVisible && (
        <div id="mega-menu-content" className="vf-mega-menu__content">
          {activeSection === 'browse-section' && (
            <div
              className="vf-mega-menu__content__section"
              id="browse-content-section"
              role="menu"
              aria-hidden={activeSection !== 'browse-section'}
            >
              <section className="vf-summary-container | embl-grid">
                <div className="vf-section-header">
                  <h2 className="vf-section-header__heading">Browse MGnify</h2>
                  <p className="vf-section-header__text">
                    Browse MGnify by study, sample, publication, genome or
                    biome.
                  </p>
                </div>
                <div className="vf-section-content | vf-grid vf-grid__col-3">
                  <div>
                    <nav className="vf-navigation vf-navigation--main">
                      <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                        <li className="vf-navigation__item">
                          <a
                            href="/metagenomics/browse/super-studies"
                            className="vf-navigation__link rotating-link"
                          >
                            Super studies <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="/metagenomics/browse/studies"
                            className="vf-navigation__link rotating-link"
                          >
                            Studies <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="/metagenomics/browse/samples"
                            className="vf-navigation__link rotating-link"
                          >
                            Samples <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="/metagenomics/browse/publications"
                            className="vf-navigation__link rotating-link"
                          >
                            Publications <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="/metagenomics/browse/genomes"
                            className="vf-navigation__link rotating-link"
                          >
                            Genomes <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="/metagenomics/browse/biomes"
                            className="vf-navigation__link rotating-link"
                          >
                            Biomes <ArrowForLink />
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>

                  <div>
                    <nav className="vf-navigation vf-navigation--main">
                      <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                        <div className="vf-section-header">
                          <h2 className="vf-section-header__heading">
                            {' '}
                            API Browser
                          </h2>
                        </div>
                        <li className="vf-navigation__item">
                          <a
                            id="api-link"
                            target="_blank"
                            className="vf-navigation__link"
                            href={config.api}
                            rel="noreferrer"
                          >
                            API &nbsp;
                            <span className="icon icon-common icon-external-link-alt" />
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </section>
            </div>
          )}
          {activeSection === 'submit-data-section' && (
            <div
              className="vf-mega-menu__content__section"
              id="submit-data-content-section"
              role="menu"
              aria-hidden={activeSection !== 'submit-data-section'}
            >
              <section className="vf-summary-container | embl-grid">
                <div className="vf-section-header">
                  <h2 className="vf-section-header__heading">Submit data</h2>
                  <p className="vf-section-header__text">
                    MGnify require data to be available in ENA before analysis.
                    To submit to MGnify, please submit your sequences to ENA and
                    grant MGnify permission to access metagenomic data in your
                    Webin account
                  </p>
                </div>
                <div className="vf-section-content | vf-grid vf-grid__col-3">
                  <div>
                    <nav className="vf-navigation vf-navigation--main">
                      <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                        <li className="vf-navigation__item">
                          <a
                            target="_blank"
                            href="https://www.ebi.ac.uk/ena/submit/webin/accountInfo"
                            className="vf-navigation__link rotating-link"
                            rel="noreferrer"
                          >
                            ENA submission portal &nbsp;
                            <span className="icon icon-common icon-external-link-alt" />
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </section>
            </div>
          )}
          {activeSection === 'text-search-section' && (
            <div
              className="vf-mega-menu__content__section"
              id="text-search-content-section"
              role="menu"
              aria-hidden={activeSection !== 'text-search-section'}
            >
              <section className="vf-summary-container | embl-grid">
                <div className="vf-section-header">
                  <h2 className="vf-section-header__heading">Search MGnify</h2>
                  <p className="vf-section-header__text">
                    Search for studies, samples and publications
                  </p>
                </div>
                <div className="vf-section-content">
                  <form
                    className="vf-form vf-form--search vf-form--search--mini | vf-sidebar vf-sidebar--end"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const searchText = searchBox.current.value;
                      if (!isAccessionLike) {
                        setSearchQuery(searchText);
                      }
                      navigate(nextURL);
                      searchBox.current.value = '';
                      searchBox.current.blur();
                    }}
                  >
                    <div className="vf-sidebar__inner">
                      <div className="vf-form__item">
                        <label
                          className="vf-form__label vf-u-sr-only | vf-search__label"
                          htmlFor="searchitem"
                        >
                          Search
                        </label>
                        <input
                          type="search"
                          onChange={handleInput}
                          placeholder="Search MGnify"
                          ref={searchBox}
                          className="vf-form__input"
                        />
                      </div>
                      <div className="search-buttons-container">
                        <button
                          type={isAccessionLike ? 'submit' : 'button'}
                          className={`vf-search__button | vf-button vf-button--primary slide-in-button ${
                            isAccessionLike
                              ? 'slide-in-shown'
                              : 'slide-in-hidden'
                          }`}
                        >
                          <span className="vf-button__text | vf-u-sr-only">
                            Go
                          </span>

                          <span className="icon icon-common icon-arrow-circle-right" />
                        </button>
                        <button
                          type={isAccessionLike ? 'button' : 'submit'}
                          onClick={
                            !isAccessionLike
                              ? null
                              : () => {
                                  const searchText = searchBox.current.value;
                                  setSearchQuery(searchText);
                                  navigate('/search/submit');
                                }
                          }
                          className={`vf-search__button | vf-button vf-button--${
                            isAccessionLike ? 'secondary' : 'primary'
                          }`}
                        >
                          <span className="vf-button__text | vf-u-sr-only">
                            Search
                          </span>

                          <span className="icon icon-common icon-search" />
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: '0 4px' }}>
                      <p className="vf-text-body--5">
                        Example searches:{' '}
                        <Link
                          to="/search/studies"
                          state={{ query: 'tara oceans' }}
                          className="vf-link"
                        >
                          Tara oceans
                        </Link>
                        ,{' '}
                        <Link
                          to="/search/studies"
                          state={{ query: 'MGYS00000410' }}
                          className="vf-link"
                        >
                          MGYS00000410
                        </Link>
                        ,{' '}
                        <Link
                          to="/search/studies"
                          state={{ query: 'human gut' }}
                          className="vf-link"
                        >
                          Human Gut
                        </Link>
                      </p>
                    </div>
                  </form>
                  {/* <TextSearch /> */}
                  <div className="vf-section-header  vf-u-margin__top--800">
                    <h2
                      className="vf-section-header__heading"
                      id="section-text"
                    >
                      Quick links
                    </h2>
                  </div>
                  <ul className="vf-list vf-u-margin__bottom--800">
                    <li className="vf-list__item">
                      <a
                        href="/metagenomics/search/studies"
                        className="vf-link rotating-link"
                      >
                        Studies <ArrowForLink />
                      </a>
                    </li>
                    <li className="vf-list__item">
                      <a
                        href="/metagenomics/search/analyses"
                        className="vf-link rotating-link"
                      >
                        Analysed samples <ArrowForLink />
                      </a>
                    </li>
                    <li className="vf-list__item">
                      <a
                        href="/metagenomics/search"
                        className="vf-link rotating-link"
                      >
                        Go to the full search page <ArrowForLink />
                      </a>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          )}
          {activeSection === 'help-section' && (
            <div
              className="vf-mega-menu__content__section"
              id="help-content-section"
              role="menu"
              aria-hidden={activeSection !== 'help-section'}
            >
              <section className="vf-summary-container | embl-grid">
                <div className="vf-section-header">
                  <h2 className="vf-section-header__heading">Help</h2>
                  <p className="vf-section-header__text">
                    Find out more about MGnify
                    <br />
                    <a className="vf-link" href="/metagenomics/help">
                      Go to the help page
                    </a>
                  </p>
                </div>
                <div className="vf-section-content | vf-grid vf-grid__col-3">
                  <div>
                    <nav className="vf-navigation vf-navigation--main">
                      <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                        <div className="vf-section-header">
                          <h2 className="vf-section-header__heading">
                            {' '}
                            Documentation
                          </h2>
                        </div>
                        <li className="vf-navigation__item">
                          <a
                            href="https://docs.mgnify.org/"
                            className="vf-navigation__link rotating-link"
                          >
                            <span className="icon icon-generic" data-icon=";" />{' '}
                            User docs
                            <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="https://shiny-portal.embl.de/shinyapps/app/06_mgnify-notebook-lab?jlpath=mgnify-examples/home.ipynb"
                            className="vf-navigation__link rotating-link"
                          >
                            <i className="icon icon-common icon-code" />
                            API access
                            <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="https://hmmer-web-docs.readthedocs.io/en/latest/index.html"
                            className="vf-navigation__link rotating-link"
                          >
                            <span
                              className="icon icon-functional"
                              data-icon="1"
                            />{' '}
                            Sequence search
                            <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="http://ftp.ebi.ac.uk/pub/databases/metagenomics/peptide_database/current_release/README.txt"
                            className="vf-navigation__link rotating-link"
                          >
                            <span
                              className="icon icon-functional"
                              data-icon="="
                            />{' '}
                            Protein DB
                            <ArrowForLink />
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                  <div>
                    <nav className="vf-navigation vf-navigation--main">
                      <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                        <div className="vf-section-header">
                          <h2 className="vf-section-header__heading">
                            Training materials
                          </h2>
                        </div>
                        <li className="vf-navigation__item">
                          <a
                            href="https://www.ebi.ac.uk/training/services/mgnify"
                            className="vf-navigation__link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            About EMBL-EBI Training &nbsp;
                            <span className="icon icon-common icon-external-link-alt" />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-portal-quick-tour"
                            className="vf-navigation__link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Tutorial about the MGnify website &nbsp;
                            <span className="icon icon-common icon-external-link-alt" />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-portal-submitting-metagenomics-da"
                            className="vf-navigation__link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Tutorial describing the data submission process
                            &nbsp;
                            <span className="icon icon-common icon-external-link-alt" />
                          </a>
                        </li>

                        <li className="vf-navigation__item">
                          <a
                            href="https://www.ebi.ac.uk/training/online/course/ebi-metagenomics-analysing-and-exploring-metagenomics-data"
                            className="vf-navigation__link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            A webinar explaining about Mgnify and the analysis
                            you can perform &nbsp;
                            <span className="icon icon-common icon-external-link-alt" />
                          </a>
                        </li>

                        <li className="vf-navigation__item">
                          <a
                            href="https://www.ebi.ac.uk/training/online/course/metagenomics-bioinformatics"
                            className="vf-navigation__link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Recorded materials from the Metagenomics
                            Bioinformatics course run at EMBL-EBI in 2018 &nbsp;
                            <span className="icon icon-common icon-external-link-alt" />
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>

                  <div>
                    <nav className="vf-navigation vf-navigation--main">
                      <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                        <div className="vf-section-header">
                          <h2 className="vf-section-header__heading">
                            Contact us
                          </h2>
                        </div>
                        <li className="vf-navigation__item">
                          <a
                            href="https://status.mgnify.org/"
                            className="vf-navigation__link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Service status page &nbsp;
                            <span className="icon icon-common icon-external-link-alt" />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="https://www.ebi.ac.uk/about/contact/support/metagenomics"
                            className="vf-navigation__link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Support and feedback &nbsp;
                            <span className="icon icon-common icon-external-link-alt" />
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'login-section' && (
            <div
              className="vf-mega-menu__content__section"
              id="login-content-section"
              role="menu"
              aria-hidden={activeSection !== 'login-section'}
            >
              <section className="vf-summary-container | embl-grid">
                <div className="vf-section-header">
                  <h2 className="vf-section-header__heading">My Data</h2>
                  <p className="vf-section-header__text">
                    Access your data and Webin account information
                  </p>
                </div>
                <div className="vf-section-content | vf-grid vf-grid__col-3">
                  <div>
                    <nav className="vf-navigation vf-navigation--main">
                      <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                        <li className="vf-navigation__item">
                          <a
                            href="/metagenomics/mydata"
                            className="vf-navigation__link rotating-link"
                          >
                            My studies
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="/metagenomics/login"
                            className="vf-navigation__link rotating-link"
                          >
                            My account
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="/metagenomics/login"
                            className="vf-navigation__link rotating-link"
                          >
                            Logout
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MegaMenu;
