import React from 'react';

const MegaMenu: React.FC = () => {
  return (
    <>
      <div
        className="vf-global-header vf-mega-menu"
        data-vf-js-mega-menu
        role="menubar"
      >
        <nav className="vf-navigation vf-navigation--global | vf-cluster">
          <ul className="vf-navigation__list | vf-list | vf-cluster__inner">
            <li className="vf-navigation__item">
              <a
                className="vf-navigation__link vf-mega-menu__link vf-mega-menu__link--has-section"
                data-vf-js-mega-menu-section-id="demo-topics-content-section"
                href="Javascript:void(0)"
              >
                Topics
              </a>
            </li>
            <li className="vf-navigation__item">
              <a
                className="vf-navigation__link vf-mega-menu__link vf-mega-menu__link--has-section"
                data-vf-js-mega-menu-section-id="demo-organization-content-section"
                href="/organization"
              >
                Organization structure
              </a>
            </li>
            <li className="vf-navigation__item">
              <a
                href="http://www.embl.org"
                className="vf-navigation__link vf-mega-menu__link"
              >
                Normal link
              </a>
            </li>
            <li className="vf-navigation__item">
              <a
                href="http://www.embl.org/about"
                className="vf-navigation__link"
              >
                About us
              </a>
            </li>
            <li className="vf-navigation__item">
              <a
                className="vf-navigation__link vf-mega-menu__link"
                data-vf-js-mega-menu-section-id="demo-search-content-section"
                href="/search"
              >
                Search
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="vf-mega-menu__content">
        <div
          className="vf-mega-menu__content__section"
          data-vf-js-mega-menu-section="demo-topics-content-section"
          role="menu"
          aria-hidden="true"
        >
          <section className="vf-summary-container | embl-grid">
            <div className="vf-section-header">
              <h2 className="vf-section-header__heading">EMBL topics</h2>
              <p className="vf-section-header__text">
                A unique approach to scientific services in Europe
              </p>
            </div>
            <div className="vf-section-content | vf-grid vf-grid__col-3">
              <div>
                <nav className="vf-navigation vf-navigation--main">
                  <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Download
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Release Notes
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        FAQ
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Help
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
              <div>
                <nav className="vf-navigation vf-navigation--main">
                  <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Download
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Release Notes
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        FAQ
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Help
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Licence
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        About
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Feedback
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
              <div>
                <nav className="vf-navigation vf-navigation--main">
                  <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Download
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Release Notes
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        FAQ
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Help
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Licence
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        About
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Feedback
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </section>
        </div>
        <div
          className="vf-mega-menu__content__section"
          data-vf-js-mega-menu-section="demo-organization-content-section"
          role="menu"
          aria-hidden="true"
        >
          <section className="vf-summary-container | embl-grid">
            <div className="vf-section-header">
              <h2 className="vf-section-header__heading">Our organization</h2>
              <p className="vf-section-header__text">About our org</p>
            </div>
            <div className="vf-section-content | vf-grid vf-grid__col-3">
              <div>
                <nav className="vf-navigation vf-navigation--main">
                  <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                    <div className="vf-section-header">
                      <h2 className="vf-section-header__heading"> A header</h2>
                    </div>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Download
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Release Notes
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        FAQ
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Help
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Licence
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        About
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Feedback
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
              <div>
                <nav className="vf-navigation vf-navigation--main">
                  <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                    <div className="vf-section-header">
                      <h2 className="vf-section-header__heading"> A header</h2>
                    </div>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Download
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Release Notes
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        FAQ
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Help
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Licence
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        About
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Feedback
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
              <div>
                <nav className="vf-navigation vf-navigation--main">
                  <ul className="vf-navigation__list | vf-list | vf-cluster__inner | vf-stack vf-stack--200">
                    <div className="vf-section-header">
                      <h2 className="vf-section-header__heading"> A header</h2>
                    </div>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Download
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Release Notes
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        FAQ
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Help
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Licence
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        About
                      </a>
                    </li>
                    <li className="vf-navigation__item">
                      <a href="/" className="vf-navigation__link">
                        Feedback
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </section>
        </div>
        <div
          className="vf-mega-menu__content__section"
          data-vf-js-mega-menu-section="demo-search-content-section"
          role="menu"
          aria-hidden="true"
        >
          <form
            action="#"
            className="vf-form vf-form--search vf-form--search--responsive | vf-sidebar vf-sidebar--end"
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
                  placeholder="Enter your search terms"
                  id="searchitem"
                  className="vf-form__input"
                />
              </div>
            </div>
            <div className="vf-section-header vf-u-margin__bottom--400 vf-u-margin__top--800">
              <h2 className="vf-section-header__heading" id="section-text">
                Popular links
              </h2>
            </div>
          </form>
          <ul className="vf-list vf-u-margin__bottom--800">
            <li className="vf-list__item">a list item</li>
            <li className="vf-list__item">another list item</li>
            <li className="vf-list__item">and another list item</li>
            <li className="vf-list__item">yet another list item</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default MegaMenu;
