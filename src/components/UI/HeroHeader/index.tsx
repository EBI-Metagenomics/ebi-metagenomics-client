import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './style.css';

import MGnifyLogo from 'images/mgnify_logo_reverse.svg';
import Link from 'components/UI/Link';
import { getDetailOrSearchURLForQuery } from '@/utils/accessions';

const HeroHeader: React.FC = () => {
  const searchBox = useRef<HTMLInputElement>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isAccessionLike, setIsAccessionLike] = useState(false);
  const [nextURL, setNextURL] = useState('/search/studies');
  const setSearchQuery = (query: string) => {
    // TODO
    console.log('setSearchQuery', query);
    // dispatch(
    //   createParamFromURL({
    //     name: 'query',
    //     value: query,
    //   })
    // );
  };

  const handleInput = () => {
    if (!searchBox.current) return;
    const accessionMatcherResults = getDetailOrSearchURLForQuery(
      searchBox.current.value.trim()
    );
    setNextURL(accessionMatcherResults.nextURL);
    setIsAccessionLike(accessionMatcherResults.isAccessionLike);
  };

  useEffect(() => {
    // ensures jump/search button state resets when using back button
    handleInput();
  }, [pathname]);

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
        <span className="vf-badge vf-badge--primary">
          <i className="icon icon-common" data-icon="&#x45;" />
          &nbsp;Early Data Release
        </span>

        <p className="vf-hero__subheading">
          Submit, analyse, discover and compare microbiome data
        </p>
        {/* <div */}
        {/*  className={`emg-header-search-wrapper ${ */}
        {/*    location.pathname !== '/' && 'hidden' */}
        {/*  }`} */}
        {/* > */}
        <div className="emg-header-search-wrapper hidden">
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
                    isAccessionLike ? 'slide-in-shown' : 'slide-in-hidden'
                  }`}
                >
                  <span className="vf-button__text | vf-u-sr-only">Go</span>

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
                  <span className="vf-button__text | vf-u-sr-only">Search</span>

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
        </div>
      </div>
    </section>
  );
};

export default HeroHeader;
