import React, { useState } from 'react';

import {
  PipelineChart1,
  PipelineChart2,
  PipelineChart3,
  PipelineChart4,
  PipelineChart41,
  PipelineChart5,
  PipelineChart6,
} from './Charts';
import {
  Table1,
  Table2,
  Table3,
  Table4,
  Table41,
  Table5,
  Table6,
} from './Tables';

type PipelineProps = {
  version: string;
};
const data = {
  1: {
    Chart: PipelineChart1,
    Table: Table1,
  },
  2: {
    Chart: PipelineChart2,
    Table: Table2,
  },
  3: {
    Chart: PipelineChart3,
    Table: Table3,
  },
  4: {
    Chart: PipelineChart4,
    Table: Table4,
  },
  4.1: {
    Chart: PipelineChart41,
    Table: Table41,
  },
  5: {
    Chart: PipelineChart5,
    Table: Table5,
  },
  6: {
    Chart: PipelineChart6,
    Table: Table6,
  },
};
const Pipeline: React.FC<PipelineProps> = ({ version }) => {
  const [stepToHighlight, setStepToHighlight] = useState(-1);
  if (!data[Number(version)]) {
    return null;
  }
  const { Chart, Table } = data[Number(version)];
  return (
    <section className={`vf-content highlight-step-${stepToHighlight}`}>
      <h2>Pipeline {version}</h2>
      <Chart onHoverStep={setStepToHighlight} />
      <h3>Pipeline tools &amp; steps</h3>
      <div onMouseLeave={() => setStepToHighlight(-1)}>
        <Table onHoverStep={setStepToHighlight} />
      </div>
    </section>
  );
};
export default Pipeline;
