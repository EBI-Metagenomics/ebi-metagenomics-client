import React from 'react';
import KOTable from './Table';
import KOBarChart from './BarChart';

const KOTab: React.FC = () => {
  return (
    <div className="vf-stack">
      <KOBarChart />
      <KOTable />
    </div>
  );
};

export default KOTab;
