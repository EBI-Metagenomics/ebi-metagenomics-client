import React from 'react';
import { JBrowseLinearGenomeView } from '@jbrowse/react-linear-genome-view2';
import Loading from 'components/UI/Loading';
import { useLGV } from 'components/Analysis/ContigViewer/V2ContigViewContext';

const ContigBrowser: React.FC = () => {
  const { viewState } = useLGV();
  if (!viewState) return <Loading size="small" />;
  return (
    <div className="vf-stack vf-stack--400">
      <JBrowseLinearGenomeView viewState={viewState} />
    </div>
  );
};

export default ContigBrowser;
