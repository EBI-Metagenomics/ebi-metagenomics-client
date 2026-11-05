import React from 'react';
import type { Download, GenomeDetailWithAnnotations } from '@/interfaces';
import TabsForQueryParameter from 'components/UI/TabsForQueryParameter';
import { createSharedQueryParamContext } from 'hooks/queryParamState/useQueryParamState';
import { SharedTextQueryParam } from 'hooks/queryParamState/QueryParamStore/QueryParamContext';
import GenomeGenericAnalysis from 'components/Genomes/Annotations';
import GenomeKeggPathwayAnalysis from 'components/Genomes/KeggPathwayAnalysis';

const tabs = [
  { label: 'KEGG classes', to: 'classes' },
  { label: 'KEGG modules', to: 'modules' },
  { label: 'KEGG pathways', to: 'pathways' },
];
const { useKeggTab, withQueryParamProvider } = createSharedQueryParamContext({
  keggTab: SharedTextQueryParam('classes'),
});

type GenomeKeggAnalysisProps = {
  annotations?: GenomeDetailWithAnnotations['annotations'];
  downloads: Download[];
};

const GenomeKeggAnalysis: React.FC<GenomeKeggAnalysisProps> = ({
  annotations,
  downloads,
}) => {
  const [tab] = useKeggTab<string>();

  return (
    <div>
      <TabsForQueryParameter
        tabs={tabs}
        queryParameter="keggTab"
        defaultValue="classes"
      />
      <div className="vf-tabs-content">
        {tab === 'classes' && (
          <GenomeGenericAnalysis
            items={annotations?.kegg_classes}
            chartTitle="Top 10 KEGG brite categories"
            subtitleSuffix="KEGG matches"
            tooltipEntityLabel="KEGG Class"
            tableType="kegg-class"
            tableTitlePrefix="KEGG classes"
            firstColumnHeaderOverride="Class ID"
            labelAccessor={(d: any) => String(d.class_id ?? d.name)}
            dataCy="genome-kegg-analysis"
          />
        )}
        {tab === 'modules' && (
          <GenomeGenericAnalysis
            items={annotations?.kegg_modules}
            chartTitle="Top 10 KEGG module categories"
            subtitleSuffix="KEGG module matches"
            tooltipEntityLabel="KEGG Module"
            tableType="kegg-module"
            tableTitlePrefix="KEGG modules"
            labelAccessor={(d: any) => String(d.name)}
            firstColumnHeaderOverride="Module ID"
            dataCy="genome-kegg-module-analysis"
          />
        )}
        {tab === 'pathways' && (
          <GenomeKeggPathwayAnalysis downloads={downloads} />
        )}
      </div>
    </div>
  );
};

export default withQueryParamProvider(GenomeKeggAnalysis);
