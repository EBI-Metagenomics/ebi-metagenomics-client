import React from 'react';
import { Link } from 'react-router-dom';

import TabsForQueryParameter from 'components/UI/TabsForQueryParameter';
import ExtLink from 'components/UI/ExtLink';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import KeggModule from './KeggModule';

const PARAMETER_NAME = 'type';
const PARAMETER_DEFAULT = 'kegg-modules';
const tabs = [
  { label: 'KEGG Module', to: 'kegg-modules' },
  { label: 'Genome properties', to: 'genome-properties' },
  { label: 'antiSMASH', to: 'antismash' },
];

const PathwaysSubPage: React.FC = () => {
  const [queryParameters] = useQueryParametersState({
    [PARAMETER_NAME]: '',
  });
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
        {queryParameters[PARAMETER_NAME] === 'kegg-modules' && <KeggModule />}
        {queryParameters[PARAMETER_NAME] === 'genome-properties' && (
          <b>genome-properties</b>
        )}
        {queryParameters[PARAMETER_NAME] === 'antismash' && <b>antismash</b>}
      </div>
    </div>
  );
};

export default PathwaysSubPage;
