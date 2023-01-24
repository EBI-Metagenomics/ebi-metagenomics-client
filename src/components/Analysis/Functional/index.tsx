import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import TabsForQueryParameter from 'components/UI/TabsForQueryParameter';
import ExtLink from 'components/UI/ExtLink';
import InfoBanner from 'components/UI/InfoBanner';

import AnalysisContext from 'pages/Analysis/AnalysisContext';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import InterProTab from './InterPro';
import GOTab from './GO';
import PfamTab from './Pfam';
import KOTab from './KO';

const PARAMETER_NAME = 'type';
const PARAMETER_DEFAULT = 'interpro';
const tabs = [
  { label: 'InterPro', to: 'interpro' },
  { label: 'GO Terms', to: 'go' },
  { label: 'Pfam', to: 'pfam' },
  { label: 'KO', to: 'ko' },
];
const FunctionalAnalysis: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);

  const [type] = useQueryParamState(PARAMETER_NAME, PARAMETER_DEFAULT);
  // const accession=overviewData.id;
  const version = Number(overviewData.attributes['pipeline-version']);
  const longReadExperiment =
    overviewData.attributes['experiment-type'] === 'long_reads_assembly';

  return (
    <div className="vf-stack">
      <p>
        These charts present the functional analysis outputs of our pipeline,
        which focus on{' '}
        <ExtLink href="http://www.ebi.ac.uk/interpro" title="InterPro website">
          InterPro
        </ExtLink>
        {version >= 5 && (
          <>
            ,{' '}
            <ExtLink
              href="https://www.ebi.ac.uk/interpro/entry/pfam/"
              title="InterPro protein families (Pfam)"
            >
              Pfam
            </ExtLink>
            ,{' '}
            <ExtLink
              href="https://www.genome.jp/kegg/ko.html"
              title="KEGG orthologue (KO) webpage"
            >
              KEGG orthologue
            </ExtLink>
          </>
        )}{' '}
        and{' '}
        <ExtLink
          href="https://www.uniprot.org/help/gene_ontology"
          title="Gene Ontology webpage"
        >
          GO
        </ExtLink>{' '}
        term annotations. These summarise the functional content of the
        sequences in the sample. The full set of results files can be found
        under the <Link to="#download">Download</Link> tab.
      </p>
      {longReadExperiment && (
        <InfoBanner title="Caution:" type="info">
          The sequences in this sample are derived from long-read sequencing
          technology. Gene-prediction on this sequence data can be problematic,
          potentially resulting in fewer and/or truncated predictions.
        </InfoBanner>
      )}
      <TabsForQueryParameter
        tabs={version >= 5 ? tabs : tabs.slice(0, 2)}
        queryParameter={PARAMETER_NAME}
        defaultValue={PARAMETER_DEFAULT}
      />
      <div className="vf-tabs-content">
        {type === 'interpro' && <InterProTab />}
        {type === 'go' && <GOTab />}
        {type === 'pfam' && <PfamTab />}
        {type === 'ko' && <KOTab />}
      </div>
    </div>
  );
};
export default FunctionalAnalysis;
