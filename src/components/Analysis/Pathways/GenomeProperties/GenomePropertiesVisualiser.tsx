import React, { useEffect, useState, useMemo } from 'react';
import HierarchyNode, { Node } from 'components/UI/Hierarchy';
import { Download } from '@/interfaces';
import { BGZipService } from 'components/Analysis/BgZipService';
import Loading from 'components/UI/Loading';
import ExtLink from 'components/UI/ExtLink';
import gpHierarchyRaw from 'data/genome-properties-hierarchy.json';
import { cloneDeep } from 'lodash-es';

interface GenomePropertiesVisualiserProps {
  download: Download;
}

const annotate = (
  node: Node,
  genomePropertiesCount: Record<string, number>
) => {
  node.count = genomePropertiesCount[node.id as string] || 0;
  node.countgen = node.count as number;
  if (node.children && node.children.length) {
    node.countgen += node.children.reduce((mem, child) => {
      return mem + annotate(child, genomePropertiesCount);
    }, 0);

    node.children = (node.children as Node[]).filter(
      (child) => (child.countgen || 0) > 0
    );
  }

  return node.countgen;
};

const GenomePropertiesVisualiser: React.FC<GenomePropertiesVisualiserProps> = ({
  download,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [genomePropertiesCount, setGenomePropertiesCount] = useState<
    Record<string, number>
  >({});
  const [shouldExpandAll, setShouldExpandAll] = useState(false);
  const [shouldCollapseAll, setShouldCollapseAll] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAllData = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const reader = new BGZipService(download, false);
        const isJsonGz = download.alias.toLowerCase().endsWith('.json.gz');

        if (isJsonGz) {
          const counts = await reader.readGenomePropertiesCountsFromGzipJSON();
          if (!cancelled) {
            setGenomePropertiesCount(counts);
          }
          return;
        }

        const ok = await reader.initialize();
        if (!ok) {
          throw new Error(
            'The selected data file is not indexed and cannot be displayed in Hierarchy view. Please use a JSON hierarchy source or Table view instead.'
          );
        }

        if (cancelled) return;

        const pageCount = reader.getPageCount();
        const counts: Record<string, number> = {};

        for (let i = 1; i <= pageCount; i++) {
          if (cancelled) return;

          console.log(`Loading Genome Properties page ${i}/${pageCount}`);
          const rows = await reader.readPageAsTSV(i);

          rows.forEach((row) => {
            if (row.length >= 3) {
              const id = row[0];
              const presence = row[2];
              counts[id] = presence === 'Yes' || presence === 'Partial' ? 1 : 0;
            }
          });
        }

        console.log(
          'Finished loading all Genome Properties pages',
          Object.keys(counts).length
        );

        if (!cancelled) {
          setGenomePropertiesCount(counts);
        }
      } catch (error) {
        console.error('Failed to load Genome Properties data', error);
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : String(error));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadAllData();

    return () => {
      cancelled = true;
    };
  }, [download]);

  const annotatedHierarchy = useMemo(() => {
    if (Object.keys(genomePropertiesCount).length === 0) return null;
    const hierarchy = cloneDeep(gpHierarchyRaw) as unknown as Node;
    annotate(hierarchy, genomePropertiesCount);
    return hierarchy;
  }, [genomePropertiesCount]);

  if (isLoading) return <Loading />;

  if (loadError) {
    return (
      <div className="vf-notice vf-notice--danger">
        <p className="vf-notice__text">
          Failed to load Genome Properties: {loadError}
        </p>
      </div>
    );
  }

  if (!annotatedHierarchy || (annotatedHierarchy.countgen || 0) === 0) {
    return (
      <div className="vf-notice vf-notice--info">
        <p className="vf-notice__text">
          No Genome Properties annotations found in this file.
        </p>
      </div>
    );
  }

  return (
    <div className="vf-stack vf-stack--400">
      <div className="vf-button-group">
        <button
          type="button"
          className="vf-button vf-button--sm vf-button--outline--primary"
          onClick={() => {
            setShouldExpandAll(true);
            setShouldCollapseAll(false);
            setTimeout(() => setShouldExpandAll(false), 500);
          }}
        >
          Expand All
        </button>
        <button
          type="button"
          className="vf-button vf-button--sm vf-button--outline--primary"
          onClick={() => {
            setShouldCollapseAll(true);
            setShouldExpandAll(false);
            setTimeout(() => setShouldCollapseAll(false), 500);
          }}
        >
          Collapse All
        </button>
      </div>

      <div
        className="vf-box vf-box--scandium vf-box--layered"
        style={{ maxHeight: '600px', overflowY: 'auto', padding: '1rem' }}
      >
        <HierarchyNode
          tree={annotatedHierarchy}
          triggerExpandAll={shouldExpandAll}
          triggerCollapseAll={shouldCollapseAll}
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
    </div>
  );
};

export default GenomePropertiesVisualiser;
