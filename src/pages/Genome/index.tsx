import React from 'react';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseObj } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import GenomesTable from 'components/Genomes/Table';
import PhyloTree from 'components/Genomes/PhyloTree';
import ReactMarkdown from 'react-markdown';

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
  return (
    <section className="vf-content">
      <h2>{genomeData.attributes.name}</h2>
      <div>
        <ReactMarkdown>
          {genomeData.attributes.description as string}
        </ReactMarkdown>
      </div>
      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <RouteForHash hash="" isDefault>
            <GenomesTable />
          </RouteForHash>
          <RouteForHash hash="#phylo-tab">
            <PhyloTree />
          </RouteForHash>
          <RouteForHash hash="#protein-catalog-tab">
            <h3>{genomeData.attributes['protein-catalogue-name'] as string}</h3>
            <ReactMarkdown>
              {genomeData.attributes['protein-catalogue-description'] as string}
            </ReactMarkdown>
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default GenomePage;
