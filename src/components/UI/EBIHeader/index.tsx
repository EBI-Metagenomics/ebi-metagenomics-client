import React, { useState } from 'react';

const EBIHeader: React.FC = () => {
  const [active, setActive] = useState(false);
  const [activeSearch, setActiveSearch] = useState(false);
  return (
    <header
      id="masthead-black-bar"
      className="clearfix masthead-black-bar | ebi-header-footer vf-content vf-u-fullbleed"
    >
      <div>
        <nav
          id="embl-bar"
          className={`embl-bar global-masthead-interactive-banner ${
            active ? 'active' : ''
          }`}
        >
          <div className="row padding-bottom-medium">
            <div className="columns padding-top-medium">
              <button
                className="close-button"
                aria-label="Close alert"
                type="button"
                onClick={() => setActive(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="columns medium-7">
              <div className="large-10 medium-12">
                <div className="margin-bottom-large padding-top-xsmall margin-top-large">
                  <h3
                    className="no-underline inline"
                    style={{ lineHeight: '1rem' }}
                  >
                    <a href="//embl.org">EMBL</a>
                  </h3>{' '}
                  was set up in 1974 as Europe’s flagship laboratory for the
                  life sciences – an intergovernmental organisation with more
                  than 80 independent research groups covering the spectrum of
                  molecular biology:
                </div>
              </div>
              <div className="row large-up-3 medium-up-3 small-up-2 no-underline medium-11">
                <div className="column padding-bottom-medium">
                  <a className="" href="https://www.embl.de/research/index.php">
                    <h5 className="inline underline">Research:</h5> perform
                    basic research in molecular biology
                  </a>
                </div>
                <div className="column padding-bottom-medium">
                  <a
                    className=""
                    href="https://www.embl.de/services/index.html"
                  >
                    <h5 className="inline underline">Services:</h5> offer vital
                    services to scientists in the member states
                  </a>
                </div>
                <div className="column padding-bottom-medium">
                  <a className="" href="https://www.embl.de/training/index.php">
                    <h5 className="inline underline">Training</h5> scientists,
                    students and visitors at all levels
                  </a>
                </div>
                <div className="column padding-bottom-medium">
                  <a
                    className=""
                    href="https://www.embl.de/research/tech_transfer/index.html"
                  >
                    <h5 className="inline underline">Transfer</h5> and
                    development of technology
                  </a>
                </div>
                <div className="column padding-bottom-medium">
                  <h5 className="inline underline">Develop</h5> new instruments
                  and methods
                </div>
                <div className="column padding-bottom-medium">
                  <h5 className="inline underline">Integrating</h5> life science
                  research in Europe
                </div>
              </div>
              <div className="margin-top-xlarge no-underline">
                <h3>
                  <a href="//embl.org" className="readmore">
                    More about EMBL
                  </a>
                </h3>
              </div>
            </div>
            <div className="columns medium-5">
              <div className="large-10 medium-12">
                <h3 className="inline">Six sites</h3>
                <p>represent EMBL in Europe.</p>
              </div>
              <div className="row medium-up-2 small-up-2">
                <div className="column">
                  <h5 className="inline">
                    <a href="//www.embl.es/">Barcelona</a>
                  </h5>
                  <p className="">Tissue biology and disease modelling</p>
                </div>
                <div className="column">
                  <h5 className="inline">
                    <a href="//www.embl.fr/">Grenoble</a>
                  </h5>
                  <p className="">Structural biology</p>
                </div>
                <div className="column">
                  <h5 className="inline">
                    <a href="//www.embl-hamburg.de/">Hamburg</a>
                  </h5>
                  <p className="">Structural biology</p>
                </div>
                <div className="column">
                  <h5 className="inline">
                    <a href="//www.embl.de/">Heidelberg</a>
                  </h5>
                  <p className="">Main laboratory</p>
                </div>
                <div className="column">
                  <h5 className="inline">
                    <a href="https://www.ebi.ac.uk/">Hinxton</a>
                  </h5>
                  <p className="margin-bottom-none">
                    EMBL-EBI: European Bioinformatics Institute
                  </p>
                </div>
                <div className="column">
                  <h5 className="inline">
                    <a href="//www.embl.it/">Rome</a>
                  </h5>
                  <p className="">Epigenetics and neurobiology</p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
      <div>
        <nav
          id="search-bar"
          className={`search-bar global-masthead-interactive-banner ${
            activeSearch ? 'active' : ''
          }`}
        >
          <div className="row padding-bottom-medium">
            <div className="columns padding-top-medium">
              <button
                className="close-button"
                aria-label="Close alert"
                type="button"
                onClick={() => setActiveSearch(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>
          <div className="row">
            <form
              id="global-search"
              name="global-search"
              action="/ebisearch/search.ebi"
              method="GET"
              className=""
            >
              <fieldset>
                <div className="input-group">
                  <input
                    type="text"
                    name="query"
                    id="global-searchbox"
                    className="input-group-field"
                    placeholder="Search all of EMBL-EBI"
                  />
                  <div className="input-group-button">
                    <input
                      type="submit"
                      name="submit"
                      value="Search"
                      className="button"
                    />
                    <input
                      type="hidden"
                      name="db"
                      value="allebi"
                      defaultChecked
                    />
                    <input
                      type="hidden"
                      name="requestFrom"
                      value="masthead-black-bar"
                      defaultChecked
                    />
                  </div>
                </div>
              </fieldset>
            </form>
          </div>
        </nav>
      </div>
      <div>
        <nav className="row">
          <ul id="global-nav" className="menu global-nav text-right">
            <li className="home-mobile">
              <a href="https://www.ebi.ac.uk"></a>
            </li>
            <li className="where embl hide">
              <a href="http://www.embl.org">EMBL</a>
            </li>
            <li className="where barcelona hide">
              <a href="#">Barcelona</a>
            </li>
            <li className="where hamburg hide">
              <a href="#">Hamburg</a>
            </li>
            <li className="where grenoble hide">
              <a href="#">Heidelberg</a>
            </li>
            <li className="where grenoble hide">
              <a href="#">Grenoble</a>
            </li>
            <li className="where rome hide">
              <a href="#">Rome</a>
            </li>
            <li
              id="embl-selector"
              className={`float-right show-for-medium embl-selector embl-ebi ${
                active ? 'active' : ''
              }`}
            >
              <button
                className="button float-right"
                onClick={() => setActive(!active)}
              >
                &nbsp;
              </button>
            </li>
            <li className="float-right search">
              <a
                href="#"
                className="inline-block collpased float-left search-toggle"
                onClick={() => setActiveSearch(!activeSearch)}
              >
                <span className="show-for-small-only">Search</span>
              </a>
            </li>
            <li className="what about">
              <a href="https://www.ebi.ac.uk/about">About us</a>
            </li>
            <li className="what training">
              <a href="https://www.ebi.ac.uk/training">Training</a>
            </li>
            <li className="what research">
              <a href="https://www.ebi.ac.uk/research">Research</a>
            </li>
            <li className="what services">
              <a href="https://www.ebi.ac.uk/services">Services</a>
            </li>
            <li className="where ebi">
              <a href="https://www.ebi.ac.uk">EMBL-EBI</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default EBIHeader;
