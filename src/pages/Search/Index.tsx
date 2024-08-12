import React, { useState } from 'react';

const SearchPage: React.FC = () => {
  // State to manage the active tab
  const [activeTab, setActiveTab] = useState('vf-tabs__section--1');

  // Function to handle tab switching
  const handleTabClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tabId: string
  ) => {
    event.preventDefault();
    setActiveTab(tabId);
  };

  return (
    <>
      <div className="vf-tabs">
        <ul className="vf-tabs__list">
          <li className="vf-tabs__item">
            <a
              className={`vf-tabs__link ${
                activeTab === 'vf-tabs__section--1' ? 'is-active' : ''
              }`}
              href="#vf-tabs__section--1"
              onClick={(e) => handleTabClick(e, 'vf-tabs__section--1')}
            >
              Search by text
            </a>
          </li>
          <li className="vf-tabs__item">
            <a
              className={`vf-tabs__link ${
                activeTab === 'vf-tabs__section--2' ? 'is-active' : ''
              }`}
              href="#vf-tabs__section--2"
              onClick={(e) => handleTabClick(e, 'vf-tabs__section--2')}
            >
              Search by Protein
            </a>
          </li>
          <li className="vf-tabs__item">
            <a
              className={`vf-tabs__link ${
                activeTab === 'vf-tabs__section--3' ? 'is-active' : ''
              }`}
              href="#vf-tabs__section--3"
              onClick={(e) => handleTabClick(e, 'vf-tabs__section--3')}
            >
              Search by Nucleotide
            </a>
          </li>
        </ul>
      </div>

      <div className="vf-tabs-content">
        <section
          className="vf-tabs__section"
          id="vf-tabs__section--1"
          style={{
            display: activeTab === 'vf-tabs__section--1' ? 'block' : 'none',
          }}
        >
          <h2>Search by text</h2>
          <p>
            Enter your text-based search query here. This section allows you to
            search by keywords or phrases.
          </p>
        </section>
        <section
          className="vf-tabs__section"
          id="vf-tabs__section--2"
          style={{
            display: activeTab === 'vf-tabs__section--2' ? 'block' : 'none',
          }}
        >
          <h2>Search by Protein</h2>
          <p>
            Use this section to search by protein sequences. Enter the relevant
            protein information to find matching results.
          </p>
        </section>
        <section
          className="vf-tabs__section"
          id="vf-tabs__section--3"
          style={{
            display: activeTab === 'vf-tabs__section--3' ? 'block' : 'none',
          }}
        >
          <h2>Search by Nucleotide</h2>
          <details className="vf-details">
            <summary className="vf-details--summary">Search by MAG</summary>
            Something small enough to escape casual notice.
          </details>

          <details className="vf-details">
            <summary className="vf-details--summary">Sarch by Gene</summary>
            Something small enough to escape casual notice.
          </details>
        </section>
      </div>
    </>
  );
};

export default SearchPage;
