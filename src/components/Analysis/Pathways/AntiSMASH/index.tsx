import React from 'react';
import AntiSMASHTable from './Table';
import AntiSMASHBarChart from './BarChart';

const KOTab: React.FC = () => {
  return (
    <div className="vf-stack">
      <AntiSMASHBarChart />
      <AntiSMASHTable />
    </div>
  );
};

export default KOTab;
