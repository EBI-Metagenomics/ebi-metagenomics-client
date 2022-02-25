import React, { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './style.css';

import MGnifyLogo from 'images/mgnify_logo_reverse.svg';
import useQueryParamsStore from 'hooks/queryParamState/QueryParamStore/useQueryParamsStore';
import { createParamFromURL } from 'hooks/queryParamState/QueryParamStore/queryParamReducer';

const HeroHeader: React.FC = () => {
  const searchBox = useRef<HTMLInputElement>();
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useQueryParamsStore();
  const setSearchQuery = (query: string) => {
    dispatch(
      createParamFromURL({
        name: 'query',
        value: query,
      })
    );
  };
  return (
    <section className="vf-hero vf-hero--400 | vf-u-fullbleed">
      <div className="vf-hero__content | vf-box | vf-stack vf-stack--400">
        <p className="vf-hero__kicker">
          <a href="https://ebi.ac.uk">EMBL-EBI</a> | MGnify
        </p>
        <h4>
          <Link to="/">
            <img src={MGnifyLogo} alt="MGnify Logo" style={{ height: '4em' }} />
          </Link>
        </h4>

        <p className="vf-hero__subheading">
          Submit, analyse, discover and compare microbiome data
        </p>
        <div
          className={`emg-header-search-wrapper ${
            location.pathname !== '/' && 'hidden'
          }`}
        >
          <form
            className="vf-form vf-form--search vf-form--search--mini | vf-sidebar vf-sidebar--end"
            onSubmit={async (e) => {
              e.preventDefault();
              const searchText = searchBox.current.value;
              setSearchQuery(searchText);
              await navigate('/search/studies');
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
                  placeholder="Search MGnify"
                  ref={searchBox}
                  className="vf-form__input"
                />
              </div>

              <button
                type="submit"
                className="vf-search__button | vf-button vf-button--primary"
              >
                <span className="vf-button__text | vf-u-sr-only">Search</span>

                <span className="icon icon-common icon-search" />
              </button>
            </div>
            <div style={{ padding: '0 4px' }}>
              <p className="vf-text-body--5">
                Example searches:{' '}
                <Link
                  to="/search/studies"
                  onClick={() => setSearchQuery('tara oceans')}
                  className="vf-link"
                >
                  Tara oceans
                </Link>
                ,{' '}
                <Link
                  to="/search/studies"
                  onClick={() => setSearchQuery('MGYS00000410')}
                  className="vf-link"
                >
                  MGYS00000410
                </Link>
                ,{' '}
                <Link
                  to="/search/studies"
                  onClick={() => setSearchQuery('human gut')}
                  className="vf-link"
                >
                  Human Gut
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroHeader;
