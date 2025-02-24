import React, { useContext, useEffect, useState } from 'react';
import HierarchyNode, { Node } from 'components/UI/Hierarchy';

import gpHierarchy from 'data/genome-properties-hierarchy.json';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import { MGnifyDatum } from '@/hooks/data/useData';
import ExtLink from 'components/UI/ExtLink';

/**
 * Annotate the nodes with the counts.
 * @param {Object} node a gp node
 * @return {int} the aggregated count for a sub-tree
 */
const annotate = (
  node: Node,
  genomePropertiesCount: Record<string, number>
) => {
  /* eslint-disable no-param-reassign */
  if (node.countgen) return node.countgen;
  node.count = genomePropertiesCount[node.id as string] || 0;
  node.countgen = (node.countgen || 0) + (node.count as number);
  if (node.children && node.children.length) {
    node.countgen += node.children.reduce((mem, child) => {
      return mem + annotate(child, genomePropertiesCount);
    }, 0);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    node.children = node.children.filter(({ countgen }) => countgen > 0);
  }
  /* eslint-enable no-param-reassign */
  return node.countgen;
};

const DELAY = 100;
const SHOULD_NOT = {
  collapse: false,
  expand: false,
};

const GenomeProperties: React.FC = () => {
  const { overviewData } = useContext(AnalysisContext);
  const { data, loading, error } = useMGnifyData(
    `analyses/${overviewData?.id}/genome-properties`
  );
  const [should, setShould] = useState(SHOULD_NOT);
  useEffect(() => {
    if (should.expand || should.collapse) {
      setTimeout(() => setShould(SHOULD_NOT), DELAY);
    }
  }, [should]);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  // const genomePropertiesCount = {};

  interface GenomePropertiesCount {
    [key: string]: number;
  }

  const genomePropertiesCount: GenomePropertiesCount = {};

  (data.data as MGnifyDatum[]).forEach((d) => {
    const id = d.attributes.accession as string;
    const { presence } = d.attributes;
    genomePropertiesCount[id] =
      presence === 'Yes' || presence === 'Partial' ? 1 : 0;
  });
  annotate(gpHierarchy, genomePropertiesCount);
  return (
    <div className="vf-stack">
      <div>
        <button
          type="button"
          className="vf-button vf-button--sm"
          onClick={() =>
            setShould({
              collapse: false,
              expand: true,
            })
          }
        >
          Expand All
        </button>
        <button
          type="button"
          className="vf-button vf-button--sm"
          onClick={() =>
            setShould({
              collapse: true,
              expand: false,
            })
          }
        >
          Collapse All
        </button>
      </div>
      <HierarchyNode
        tree={gpHierarchy as unknown as Node}
        triggerExpandAll={should.expand}
        triggerCollapseAll={should.collapse}
        getLabel={(node: Node): string | React.ReactElement => {
          return (
            <>
              <ExtLink
                href={`https://www.ebi.ac.uk/interpro/genomeproperties/genome-property/${node.id}`}
              >
                {node.id as string}
              </ExtLink>
              : {node.name}
            </>
          );
        }}
      />
    </div>
  );
};

export default GenomeProperties;
