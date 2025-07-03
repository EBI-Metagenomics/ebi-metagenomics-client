import React from 'react';
import './style.css';

const SearchPage: React.FC = () => {
  return (
    <div className="unified-search-container">
      <div className="search-input-container">
        <div className="search-input-with-button">
          <input
            type="text"
            className="vf-form__input search-text-input"
            placeholder="Enter keywords, sample names, or biome types..."
          />
          <button className="vf-button vf-button--primary vf-button--large">
            Search
          </button>
        </div>
        {/* <div className="search-examples"> */}
        {/*  <p> */}
        {/*    Examples: <span className="search-example">human gut</span>,{' '} */}
        {/*    <span className="search-example">ocean water</span>,{' '} */}
        {/*    <span className="search-example">MGYS00000001</span> */}
        {/*  </p> */}
        {/* </div> */}
      </div>
    </div>
  );
};

export default SearchPage;
