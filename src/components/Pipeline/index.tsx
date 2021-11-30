import React, { useState } from 'react';

import { PipelineChart1 } from './Charts';
import { Table1 } from './Tables';

type PipelineProps = {
  version: string;
};
const data = {
  1: {
    Chart: PipelineChart1,
    Table: Table1,
  },
};
const Pipeline: React.FC<PipelineProps> = ({ version }) => {
  const [stepToHighlight, setStepToHighlight] = useState(-1);
  if (!data[Number(version)]) {
    return null;
  }
  const { Chart } = data[Number(version)];
  return (
    <section className={`vf-content highlight-step-${stepToHighlight}`}>
      <h2>Pipeline {version}</h2>
      <Chart />
      <div onMouseLeave={() => setStepToHighlight(-1)}>
        <Table1 onHoverStep={setStepToHighlight} />
      </div>
    </section>
  );
};
export default Pipeline;
