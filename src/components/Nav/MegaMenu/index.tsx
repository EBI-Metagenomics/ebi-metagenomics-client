import React, { useState } from 'react';
import { clearParams } from 'hooks/queryParamState/QueryParamStore/queryParamReducer';
import ExtLink from 'components/UI/ExtLink';
import ArrowForLink from 'components/UI/ArrowForLink';

const MegaMenu: React.FC = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleMouseEnter = (sectionId: string) => {
    setMenuVisible(true);
    setActiveSection(sectionId);
  };

  const handleMouseLeave = () => {
    setMenuVisible(false);
    setActiveSection(null);
  };
  return (
    <>
      <div className="vf-global-header vf-mega-menu" role="menubar">
        {/* <nav className="vf-navigation vf-navigation--global | vf-cluster"> */}
        <nav className="vf-navigation | vf-cluster">
          <ul className="vf-navigation__list | vf-list | vf-cluster__inner">
            <li className="vf-navigation__item">
              <a
                className="vf-navigation__link vf-mega-menu__link"
                id="demo-topics-content-section"
                href="/"
              >
                Overview
              </a>
            </li>
            <li className="vf-navigation__item">
              <a
                className="vf-navigation__link vf-mega-menu__link"
                id="demo-organization-content-section"
                href="/orgfwfwfwanization"
              >
                Submit data &nbsp;
                <span className="icon icon-common icon-external-link-alt" />
              </a>
            </li>
            <li className="vf-navigation__item">
              <a
                className={`vf-navigation__link vf-mega-menu__link vf-mega-menu__link--has-section ${
                  activeSection === 'text-search-section' ? 'active' : ''
                }`}
                id="text-search-section"
                href="Javascript:void(0)"
                onMouseEnter={() => handleMouseEnter('text-search-section')}
              >
                Text search
              </a>
            </li>
            <li className="vf-navigation__item">
              <a
                href="http://www.embl.org/fwfwfwwf"
                className="vf-navigation__link vf-mega-menu__link"
              >
                Sequence search &nbsp;
                <span className="icon icon-common icon-external-link-alt" />
              </a>
            </li>
            <li className="vf-navigation__item">
              <a
                className={`vf-navigation__link vf-mega-menu__link vf-mega-menu__link--has-section ${
                  activeSection === 'browse-section' ? 'active' : ''
                }`}
                id="browse-section"
                href="Javascript:void(0)"
                onMouseEnter={() => handleMouseEnter('browse-section')}
              >
                Browse data
              </a>
            </li>

            <li className="vf-navigation__item">
              <a
                className="vf-navigation__link vf-mega-menu__link"
                id="demo-search-content-section"
                href="/search"
              >
                About
              </a>
            </li>

            <li className="vf-navigation__item">
              <a
                className={`vf-navigation__link vf-mega-menu__link vf-mega-menu__link--has-section ${
                  activeSection === 'help-section' ? 'active' : ''
                }`}
                id="help-section"
                href="Javascript:void(0)"
                onMouseEnter={() => handleMouseEnter('help-section')}
              >
                Help
              </a>
            </li>

            <li className="vf-navigation__item">
              <a
                className="vf-navigation__link vf-mega-menu__link"
                id="demo-search-content-section"
                href="/search"
              >
                Login
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {menuVisible && (
        <div className="vf-mega-menu__content">
          {activeSection === 'browse-section' && (
            <div
              className="vf-mega-menu__content__section"
              id="browse-content-section"
              role="menu"
              onMouseLeave={handleMouseLeave}
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
                          <a href="/" className="vf-navigation__link">
                            Super studies <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a href="/" className="vf-navigation__link">
                            Studies <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a href="/" className="vf-navigation__link">
                            Samples <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a href="/" className="vf-navigation__link">
                            Publications <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a href="/" className="vf-navigation__link">
                            Genomes <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a href="/" className="vf-navigation__link">
                            Biomes <ArrowForLink />
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
              id="demo-search-content-section"
              role="menu"
              onMouseLeave={handleMouseLeave}
              aria-hidden={activeSection !== 'text-search-section'}
            >
              <section className="vf-summary-container | embl-grid">
                <div className="vf-section-header">
                  <h2 className="vf-section-header__heading">Search MGnify</h2>
                  <p className="vf-section-header__text">
                    Search for studies, samples abd publications
                  </p>
                </div>
                <div className="vf-section-content">
                  <form className="vf-form vf-form--search vf-sidebar vf-sidebar--end mg-text-search">
                    <div className="vf-sidebar__inner">
                      <div className="vf-form__item | vf-search__item">
                        <input
                          type="text"
                          placeholder="Enter your search terms"
                          id="mg-text-search"
                          className="vf-form__input | st-default-search-input mg-text-search-textfield"
                        />
                      </div>
                      <div className="vf-form__item | vf-search__item">
                        <button
                          type="submit"
                          className="vf-search__button | vf-button vf-button--primary mg-text-search-button"
                        >
                          <span className="vf-button__text">Search </span>
                          <span className="icon icon-common icon-search" />
                        </button>
                        <button
                          type="button"
                          className="vf-search__button | vf-button vf-button--tertiary mg-text-search-clear"
                        >
                          <span className="vf-button__text">Clear All </span>
                          <span className="icon icon-common icon-times-circle" />
                        </button>
                      </div>
                    </div>
                  </form>
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
                      <a href="/parago" className="vf-link">
                        Studies <span className="mg-number">4600</span>
                      </a>
                    </li>
                    <li className="vf-list__item">
                      <a href="/dd" className="vf-link">
                        Samples <span className="mg-number">(4600)</span>
                      </a>
                    </li>
                    <li className="vf-list__item">
                      <a href="/gg" className="vf-link">
                        Publications <span className="mg-number">(4600)</span>
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
              id="browse-content-section"
              role="menu"
              onMouseLeave={handleMouseLeave}
              aria-hidden={activeSection !== 'help-section'}
            >
              <section className="vf-summary-container | embl-grid">
                <div className="vf-section-header">
                  <h2 className="vf-section-header__heading">Help</h2>
                  <p className="vf-section-header__text">
                    Find out more about MGnify
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
                            href="JavaScript:Void(0);"
                            className="vf-navigation__link"
                          >
                            <span className="icon icon-generic" data-icon=";" />{' '}
                            User documentation
                            <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="JavaScript:Void(0);"
                            className="vf-navigation__link"
                          >
                            <i className="icon icon-common icon-code" /> API
                            access
                            <ArrowForLink />
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="JavaScript:Void(0);"
                            className="vf-navigation__link"
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
                            href="JavaScript:Void(0);"
                            className="vf-navigation__link"
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
                            href="JavaScript:Void(0);"
                            className="vf-navigation__link"
                          >
                            Tutorial about the MGnify website
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="https://www.ebi.ac.uk/about/contact/support/metagenomics"
                            className="vf-navigation__link"
                          >
                            Tutorial describing the data submission process
                          </a>
                        </li>

                        <li className="vf-navigation__item">
                          <a
                            href="https://www.ebi.ac.uk/about/contact/support/metagenomics"
                            className="vf-navigation__link"
                          >
                            A webinar explaining about Mgnify and the analysis
                            you can perform
                          </a>
                        </li>

                        <li className="vf-navigation__item">
                          <a
                            href="https://www.ebi.ac.uk/about/contact/support/metagenomics"
                            className="vf-navigation__link"
                          >
                            Recorded materials from the Metagenomics
                            Bioinformatics course run at EMBL-EBI in 2018
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
                            href="JavaScript:Void(0);"
                            className="vf-navigation__link"
                          >
                            Service status page
                          </a>
                        </li>
                        <li className="vf-navigation__item">
                          <a
                            href="https://www.ebi.ac.uk/about/contact/support/metagenomics"
                            className="vf-navigation__link"
                          >
                            Support and feedback
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
    </>
  );
};

export default MegaMenu;
