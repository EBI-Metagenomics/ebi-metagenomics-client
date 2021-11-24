import React from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import HierarchyNode, { Node } from 'components/UI/Hierarchy';
import useMGnifyData from 'hooks/data/useMGnifyData';
import useURLAccession from 'hooks/useURLAccession';

const PhyloTree: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(
    `genome-catalogues/${accession}/downloads/phylo_tree.json`
  );
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  return (
    <HierarchyNode
      tree={data as unknown as Node}
      getLabel={(node) => {
        const label = node.name.split('__').pop();
        if (node.type === 'genome') {
          return (
            <Link to={`/genomes/${label}`} style={{ backgroundColor: 'white' }}>
              {label}
            </Link>
          );
        }

        return label || 'Unknown';
      }}
    />
  );
};
export default PhyloTree;
