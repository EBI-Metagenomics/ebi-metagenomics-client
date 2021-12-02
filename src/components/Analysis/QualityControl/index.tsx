import React from 'react';

import { MGnifyDatum } from 'hooks/data/useData';
import QualityControlChart from './QCChart';

import './style.css';

type QualityControlProps = {
  data: MGnifyDatum;
};
const QualityControl: React.FC<QualityControlProps> = ({ data }) => {
  const isAssembly = data.attributes['experiment-type'] === 'assembly';

  return (
    <div className="vf-stack vf-stack--200">
      <p>
        The chart below shows the number of {isAssembly ? 'contigs' : 'reads'}{' '}
        which pass the quality control steps in the pipeline. Paired-end
        sequences may have been merged, in which case the initial number of{' '}
        {isAssembly ? 'contigs' : 'reads'} may differ from the number given by
        ENA.
      </p>
      <QualityControlChart analysisData={data} />
    </div>
  );
};

export default QualityControl;
