import React from 'react';
import KeggTable from './Table';
import KeggBarChart from './BarChart';

const KOTab: React.FC = () => {
  return (
    <div className="vf-stack">
      <KeggBarChart />
      <KeggTable />
    </div>
  );
};

export default KOTab;
