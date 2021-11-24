import React from 'react';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseObj } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import ExtLink from 'components/UI/ExtLink';
import GenomesTable from 'components/Genomes/Table';
import PhyloTree from 'components/Genomes/PhyloTree';
import { processMDLinks } from 'utils/miniMDProcessor';
import RouteForHash from 'components/Nav/RouteForHash';

const tabs = [
  { label: 'Genome list', to: '#' },
  { label: 'Taxonomy tree', to: '#phylo-tab' },
  { label: 'Protein catalogue', to: '#protein-catalog-tab' },
  { label: 'Search by Gene', to: '#genome-search-tab' },
  { label: 'Search by MAG', to: '#genome-search-mag-tab' },
];

const GenomePage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(
    `genome-catalogues/${accession}`
  );
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: genomeData } = data as MGnifyResponseObj;
  const blocks = processMDLinks(
    (genomeData.attributes.description as string) || ''
  );
  return (
    <section className="vf-content">
      <h2>{genomeData.attributes.name}</h2>
      <p>
        {blocks.map((block) =>
          block.type === 'text' ? (
            <span key={block.content}>{block.content}</span>
          ) : (
            <ExtLink key={block.content} href={block.href}>
              {block.content}
            </ExtLink>
          )
        )}
      </p>
      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <RouteForHash hash="" isDefault>
            <GenomesTable />
          </RouteForHash>
          <RouteForHash hash="#phylo-tab">
            <PhyloTree />
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default GenomePage;
