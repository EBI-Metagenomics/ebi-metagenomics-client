import React, { Suspense, lazy } from 'react';

import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseObj } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import RouteForHash from 'components/Nav/RouteForHash';
import Overview from 'components/Genomes/Overview';
// import GenomeBrowser from 'components/Genomes/Browser';
import { cleanTaxLineage } from 'utils/taxon';

const GenomeBrowser = lazy(() => import('components/Genomes/Browser'));

const tabs = [
  { label: 'Overview', to: '#overview' },
  { label: 'Browse genome', to: '#genome-browser' },
  { label: 'COG analysis', to: '#cog-analysis' },
  { label: 'KEGG class analysis', to: '#kegg-class-analysis' },
  { label: 'KEGG module analysis', to: '#kegg-module-analysis' },
  { label: 'Downloads', to: '#downloads' },
];

const GenomePage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`genomes/${accession}`);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: genomeData } = data as MGnifyResponseObj;
  return (
    <section className="vf-content">
      <h2>Genome {accession}</h2>
      <p>
        <b>Type:</b> {genomeData.attributes.type}
      </p>
      <p>
        <b>Taxonomic lineage:</b>{' '}
        {cleanTaxLineage(
          genomeData.attributes['taxon-lineage'] as string,
          ' > '
        )}
      </p>
      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <RouteForHash hash="#overview" isDefault>
            <Overview data={genomeData} />
          </RouteForHash>
          <RouteForHash hash="#genome-browser">
            <Suspense fallback={<Loading size="large" />}>
              <GenomeBrowser />
            </Suspense>
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default GenomePage;