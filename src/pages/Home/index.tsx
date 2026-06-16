import React, { useContext, useEffect, useState } from 'react';
import Publications, { MainPublication } from 'components/Publications';
import InnerCard from 'components/UI/InnerCard';
import EMGModal from 'components/UI/EMGModal';
import UserContext from 'pages/Login/UserContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PrivateRequest from 'components/Home/Request/Private';
import MailForm from 'components/Home/Request/MailForm';
import './style.css';
import useReveal from 'hooks/useReveal';
import TrainingResources from 'components/Home/TrainingResources';
import LatestStudies from 'components/Home/Request/LatestStudies';
import BlogExcerpts from 'components/Home/BlogExcerpts';
import {
  DetailOrSearchURLType,
  getDetailOrSearchURLForQuery,
} from 'utils/accessions';

const HomePage: React.FC = () => {
  const SearchIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line
        x1="16.5"
        y1="16.5"
        x2="22"
        y2="22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  const ProteinIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M6.5 3
         C14 3 14 6.5 6.5 6.5
         C-1 6.5 -1 10 6.5 10
         C14 10 14 13.5 6.5 13.5
         C-1 13.5 -1 17 6.5 17"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 5 L15.5 5
         M4 8.5 L6.5 8.5
         M13 12 L15.5 12
         M4 15.5 L6.5 15.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );

  const DnaIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 4c5 0 7 4 12 4" stroke="currentColor" strokeWidth="2" />
      <path d="M6 20c5 0 7-4 12-4" stroke="currentColor" strokeWidth="2" />
      <path d="M8 8h8M7 12h10M8 16h8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
  const analysisRef = useReveal();
  const studiesRef = useReveal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromQueryParamValue = searchParams.get('from');
  const { isAuthenticated } = useContext(UserContext);
  const [isAccessionLike, setIsAccessionLike] =
    useState<DetailOrSearchURLType>();
  const [modal, setModal] = useState({
    show:
      isAuthenticated &&
      ['public-request', 'private-request'].includes(
        fromQueryParamValue as string
      ),
    isPublic: fromQueryParamValue === 'public-request',
  });
  const [searchTerms, setSearchTerms] = useState('');

  useEffect(() => {
    const accessionMatcherResults = getDetailOrSearchURLForQuery(
      searchTerms.trim()
    );
    setIsAccessionLike(accessionMatcherResults);
  }, [searchTerms]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const accessionMatcherResults = getDetailOrSearchURLForQuery(
      searchTerms.trim()
    );
    setIsAccessionLike(accessionMatcherResults);
    navigate(accessionMatcherResults.nextURL);
  };
  return (
    <section className="vf-content vf-stack vf-stack--800">
      <EMGModal
        isOpen={modal.show}
        onRequestClose={() =>
          setModal({
            show: false,
            isPublic: true,
          })
        }
        contentLabel="Request Analysis"
      >
        {modal.isPublic ? <MailForm isPublic /> : <PrivateRequest />}
      </EMGModal>
      {/* Hero section with stylized layout */}
      <div className="home-hero compact-hero">
        <div className="home-hero-bg-pattern" />
        <div className="home-hero-content">
          <h1 className="vf-text vf-text--display vf-text--bold home-search-title">
            Search study and sample descriptions
          </h1>
          {/* <p className="vf-text vf-text-body home-search-subtext"> */}
          {/*  Explore datasets using text, protein, or nucleotide sequences. */}
          {/* </p> */}
          <div className="home-search-box">
            <form className="search-input-container" onSubmit={onSearch}>
              <div className="search-input-with-button">
                <input
                  type="text"
                  className="vf-form__input search-text-input"
                  placeholder="Enter keywords, sample names, or biome types..."
                  value={searchTerms}
                  onChange={(e) => setSearchTerms(e.target.value)}
                />
                <button
                  type={'submit'}
                  onClick={onSearch}
                  className={`vf-search__button | vf-button vf-button--primary`}
                >
                  <span
                    className={`icon icon-common ${
                      isAccessionLike?.isAccessionLike
                        ? 'icon-arrow-circle-right'
                        : 'icon-search'
                    }`}
                  />{' '}
                  {isAccessionLike?.isAccessionLike
                    ? isAccessionLike.resourceOfType
                    : 'Search'}
                </button>
              </div>
            </form>
          </div>
          <p className="vf-text-body--2 home-search-examples">
            Example searches:{' '}
            <Link to="/search?query=tara+oceans">
              <code>Tara oceans</code>
            </Link>
            ,{' '}
            <Link to="/search?query=MGYS00000410">
              <code>MGYS00000410</code>
            </Link>
            ,{' '}
            <Link to="/search?query=human+gut">
              <code>Human Gut</code>
            </Link>
          </p>
        </div>
      </div>

      {/* Search method cards in VF grid layout */}
      <div className="home-search-cards vf-grid vf-grid__col-3">
        <div className="vf-card home-search-card">
          <InnerCard
            title="Search by Text"
            label="Find resources using keywords, names, or descriptions"
            to="/search"
            icon={SearchIcon}
          />
        </div>
        <div className="vf-card home-search-card">
          <InnerCard
            title="Search by Protein"
            label="Find resources using nucleotide or protein sequences"
            to="https://www.ebi.ac.uk/metagenomics/proteins/"
            icon={ProteinIcon}
            externalLink
          />
        </div>
        <div className="vf-card home-search-card">
          <InnerCard
            title="Search by Nucleotide"
            label="Find metagenomes using nucleotide sequences"
            to="/search-tools"
            icon={DnaIcon}
          />
        </div>
      </div>

      <hr className="vf-divider" />

      <section
        ref={studiesRef}
        className="vf-section vf-section--highlight request-analysis-section reveal"
      >
        <div className="request-analysis-bg-pattern" />
        <h2 className="vf-section__title">Latest Studies</h2>
        <div className="home-search-cards vf-grid vf-grid__col-1">
          <LatestStudies />
        </div>
      </section>

      <hr className="vf-divider" />

      {/* Request analysis section with background texture and reveal animation */}
      <section
        ref={analysisRef}
        className="vf-section vf-section--highlight request-analysis-section reveal"
      >
        <div className="request-analysis-bg-pattern" />
        <h2 className="vf-section__title">Request an Analysis</h2>
        <div className="home-search-cards vf-grid vf-grid__col-2">
          <div className="vf-card home-search-card">
            <InnerCard
              title="Submit and/or Request"
              label="Submit your data for analysis by the MGnify team"
              to={
                isAuthenticated
                  ? () => setModal({ show: true, isPublic: false })
                  : '/login?from=private-request'
              }
            />
          </div>
          <div className="vf-card home-search-card">
            <InnerCard
              title="Request Public Dataset"
              label="Request analysis of publicly available microbiome datasets"
              to={
                isAuthenticated
                  ? () => setModal({ show: true, isPublic: true })
                  : '/login?from=public-request'
              }
            />
          </div>
        </div>
      </section>

      {/* Explore by data type and biome section */}
      {/* TODO  Make counts appear in this section */}
      {/* <section ref={exploreRef} className="vf-section reveal"> */}
      {/*  <h2 className="vf-section__title">Explore by Data Type or Biome</h2> */}
      {/*  <div className="search-by-modernized"> */}
      {/*    <SearchBy /> */}
      {/*  </div> */}
      {/* </section> */}

      <section className="vf-section">
        <h2 className="vf-section__title">Spotlight & Articles</h2>
        <BlogExcerpts />
      </section>

      <section className="vf-section">
        <h2 className="vf-section__title">Latest Publications</h2>
        <Publications />
      </section>

      <section className="vf-section">
        <h2 className="vf-section__title">How to Cite MGnify</h2>
        <MainPublication />
      </section>

      <section className="vf-section">
        <h2 className="vf-section__title">EMBL-EBI Training</h2>
        <TrainingResources />
      </section>

      <h2></h2>
    </section>
  );
};

export default HomePage;
