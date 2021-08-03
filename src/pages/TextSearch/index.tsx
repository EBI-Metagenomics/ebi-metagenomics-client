import React from 'react';
import CentreNameFilter from 'components/Search/Filter/CentreName';
import SearchTabs from 'src/components/Search/Tabs';
import TextSearch from 'src/components/Search/Filter/Text';
import SearchTable from 'src/components/Search/Table';

const TextSearchPage: React.FC = () => {
  return (
    <section className="vf-content">
      <h2>Text Search.</h2>
      <TextSearch />
      <SearchTabs />
      <section className="embl-grid">
        <div className="vf-stack vf-stack--400">
          <CentreNameFilter />
        </div>
        <SearchTable />
      </section>
    </section>
  );
};

export default TextSearchPage;
