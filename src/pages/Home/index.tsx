import React from 'react';
import Publications, { MainPublication } from 'components/Publications';
import InnerCard from 'components/UI/InnerCard';
import './style.css';
import SearchPage from 'pages/Search';
import useReveal from 'hooks/useReveal';
import TrainingResources from 'components/Home/TrainingResources';

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
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="6" cy="6" r="2" fill="currentColor" />
      <circle cx="12" cy="10" r="2" fill="currentColor" />
      <circle cx="18" cy="6" r="2" fill="currentColor" />
      <circle cx="6" cy="18" r="2" fill="currentColor" />
      <circle cx="18" cy="18" r="2" fill="currentColor" />
      <line
        x1="7.7"
        y1="7.2"
        x2="10.3"
        y2="8.8"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <line
        x1="13.7"
        y1="8.8"
        x2="16.3"
        y2="7.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <line
        x1="8"
        y1="16"
        x2="10"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <line
        x1="14"
        y1="12"
        x2="16"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.8"
      />
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
  useReveal();
  return (
    <section className="vf-content vf-stack vf-stack--800">
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
            <SearchPage />
          </div>
          {/* <p className="vf-text-body--2 home-search-examples"> */}
          {/*  Examples: <code>Tara Oceans</code>, <code>MGYS00000410</code>,{' '} */}
          {/*  <code>Human Gut</code> */}
          {/* </p> */}
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
            label="Search for resources using  nucleotide or protein sequences"
            to="/biomes"
            icon={ProteinIcon}
          />
        </div>
        <div className="vf-card home-search-card">
          <InnerCard
            title="Search by Nucleotide"
            label="Search metagenomes using nucleotide sequences"
            to="/search-tools"
            icon={DnaIcon}
          />
        </div>
      </div>

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
              to="/submit-request"
            />
          </div>
          <div className="vf-card home-search-card">
            <InnerCard
              title="Request Public Dataset"
              label="Request analysis of publicly available microbiome datasets"
              to="/public-request"
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

      {/* <section className="vf-section"> */}
      {/*  <h2 className="vf-section__title">Spotlight & Articles</h2> */}
      {/*  <BlogExcerpts /> */}
      {/* </section> */}

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
