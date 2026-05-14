import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import TabsForQueryParameter from 'components/UI/TabsForQueryParameter';
import ExtLink from 'components/UI/ExtLink';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { createSharedQueryParamContext } from 'hooks/queryParamState/useQueryParamState';
import KeggModule from './KeggModule/v2Index';
import AntiSMASH from './AntiSMASH/v2Index';
import GenomeProperties from './GenomeProperties/v2Index';
import { SharedTextQueryParam } from 'hooks/queryParamState/QueryParamStore/QueryParamContext';

const PARAMETER_NAME = 'type';
const PARAMETER_DEFAULT = 'kegg-modules';
const tabs = [
  { label: 'KEGG Module', to: 'kegg-modules' },
  { label: 'Genome properties', to: 'genome-properties' },
  { label: 'antiSMASH', to: 'antismash' },
];

const { useType, withQueryParamProvider } = createSharedQueryParamContext({
  type: SharedTextQueryParam(PARAMETER_DEFAULT),
});

const PathwaysSubPage: React.FC = () => {
  const { overviewData: data } = useContext(AnalysisContext);
  const [type] = useType<string>();
  const activeType = type || PARAMETER_DEFAULT;

  if (!data) {
    return <div>Loading...</div>;
  }

  const versionStr = data.pipeline_version || '';
  const version = parseFloat(versionStr.replace(/^V/i, ''));
  const isLegacy = !Number.isNaN(version) && version < 6;

  return (
    <div>
      <p>
        These are the results from the biochemical pathways and systems
        predictions steps of our pipeline. These summarise the{' '}
        <ExtLink href="https://www.genome.jp/kegg/module.html">
          KEGG Module
        </ExtLink>
        ,{' '}
        <ExtLink href="https://www.ebi.ac.uk/interpro/genomeproperties/">
          Genome Properties
        </ExtLink>{' '}
        and{' '}
        <ExtLink href="https://antismash.secondarymetabolites.org">
          antiSMASH
        </ExtLink>{' '}
        annotations in this assembly. The full set of results files may be found
        under the <Link to="#download">Download</Link> tab.
      </p>
      <TabsForQueryParameter
        tabs={tabs}
        queryParameter={PARAMETER_NAME}
        defaultValue={PARAMETER_DEFAULT}
      />
      <div className="vf-tabs-content">
        {activeType === 'kegg-modules' && (
          <KeggModule
            isLegacy={isLegacy}
            legacyFile={
              data.downloads.find(
                (f) =>
                  (f.download_type === 'Functional analysis' ||
                    f.download_group.includes('pathways')) &&
                  f.url.endsWith('.summary.kegg_pathways')
              ) ||
              data.downloads.find(
                (f) =>
                  (f.download_type === 'Functional analysis' ||
                    f.download_group.includes('pathways')) &&
                  f.alias.toLowerCase().includes('_summary.kegg_pathways')
              )
            }
          />
        )}
        {activeType === 'genome-properties' && (
          <GenomeProperties
            isLegacy={isLegacy}
            legacyFile={
              data.downloads.find(
                (f) =>
                  (f.download_type === 'Functional analysis' ||
                    f.download_group.includes('pathways')) &&
                  f.url.endsWith('.summary.gprops')
              ) ||
              data.downloads.find(
                (f) =>
                  (f.download_type === 'Functional analysis' ||
                    f.download_group.includes('pathways')) &&
                  f.alias.toLowerCase().includes('_summary.gprops')
              )
            }
          />
        )}
        {activeType === 'antismash' && (
          <AntiSMASH
            isLegacy={isLegacy}
            legacyFile={
              data.downloads.find(
                (f) =>
                  (f.download_type === 'Functional analysis' ||
                    f.download_group.includes('pathways')) &&
                  f.url.endsWith('.summary.antismash')
              ) ||
              data.downloads.find(
                (f) =>
                  (f.download_type === 'Functional analysis' ||
                    f.download_group.includes('pathways')) &&
                  f.alias.toLowerCase().includes('_summary.antismash')
              )
            }
          />
        )}
      </div>
    </div>
  );
};

export default withQueryParamProvider(PathwaysSubPage);
