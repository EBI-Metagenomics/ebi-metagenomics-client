import React from 'react';
import PfamTable from './Table';
import PfamBarChart from './BarChart';

const PfamTab: React.FC = () => {
  return (
    <div className="vf-stack">
      <PfamBarChart />
      <PfamTable />
    </div>
  );
};

export default PfamTab;
