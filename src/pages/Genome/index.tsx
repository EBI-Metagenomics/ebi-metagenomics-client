import React, { Suspense, lazy, useState } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import RouteForHash from 'components/Nav/RouteForHash';
import Overview from 'components/Genomes/Overview';
import Downloads from 'components/Downloads';
import useMGnifyData from '@/hooks/data/useMGnifyData';
import { MGnifyResponseObj } from '@/hooks/data/useData';
import useURLAccession from '@/hooks/useURLAccession';
import { cleanTaxLineage } from '@/utils/taxon';
import Breadcrumbs from 'components/Nav/Breadcrumbs';

const GenomeBrowser = lazy(() => import('components/Genomes/Browser'));
const COGAnalysis = lazy(() => import('components/Genomes/COGAnalysis'));
const KEGGClassAnalysis = lazy(
  () => import('components/Genomes/KEGGClassAnalysis')
);
const KEGGModulesAnalysis = lazy(
  () => import('components/Genomes/KEGGModulesAnalysis')
);

const tabs = [
  { label: 'Overview', to: '#overview' },
  { label: 'Browse genome', to: '#genome-browser' },
  { label: 'COG analysis', to: '#cog-analysis' },
  { label: 'KEGG class analysis', to: '#kegg-class-analysis' },
  { label: 'KEGG module analysis', to: '#kegg-module-analysis' },
  { label: 'Metagenome search', to: '#metagenome-search' },
  { label: 'Downloads', to: '#downloads' },
];

const GenomePage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`genomes/${accession}`);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleMetagenomeSearch = () => {
    setIsSearching(true);

    // Mock search results
    const mockResults = [
      {
        acc: 'ERR1234567',
        assay_type: 'AMPLICON',
        bioproject: 'PRJEB12345',
        biosample_link: 'https://www.ebi.ac.uk/biosample/SAMEA123456',
        cANI: 0.95,
        collection_date_sam: '2023-01-15',
        containment: 0.78,
        geo_loc_name_country_calc: 'United Kingdom',
        organism: 'Marine microbiome',
      },
      {
        acc: 'ERR7890123',
        assay_type: 'METAGENOMIC',
        bioproject: 'PRJEB67890',
        biosample_link: 'https://www.ebi.ac.uk/biosample/SAMEA789012',
        cANI: 0.87,
        collection_date_sam: '2023-02-20',
        containment: 0.65,
        geo_loc_name_country_calc: 'Germany',
        organism: 'Soil microbiome',
      },
      {
        acc: 'ERR4567890',
        assay_type: 'METAGENOMIC',
        bioproject: 'PRJEB45678',
        biosample_link: 'https://www.ebi.ac.uk/biosample/SAMEA456789',
        cANI: 0.92,
        collection_date_sam: '2023-03-10',
        containment: 0.82,
        geo_loc_name_country_calc: 'France',
        organism: 'Gut microbiome',
      },
    ];

    // Simulate API delay
    setTimeout(() => {
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 2000);
  };

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: genomeData } = data as MGnifyResponseObj;
  type RelatedCatalogue = {
    data: {
      id: string;
      type: string;
    };
    links: {
      related: string;
    };
  };
  const relatedCatalogue = genomeData.relationships
    .catalogue as RelatedCatalogue;
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    {
      label: 'Genomes',
      url: '/browse/genomes',
    },
    {
      label: relatedCatalogue.data.id,
      url: `/genome-catalogues/${relatedCatalogue.data.id}`,
    },
    { label: accession },
  ];
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
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
          <RouteForHash hash="#cog-analysis">
            <Suspense fallback={<Loading size="large" />}>
              <COGAnalysis />
            </Suspense>
          </RouteForHash>
          <RouteForHash hash="#kegg-class-analysis">
            <Suspense fallback={<Loading size="large" />}>
              <KEGGClassAnalysis />
            </Suspense>
          </RouteForHash>
          <RouteForHash hash="#kegg-module-analysis">
            <Suspense fallback={<Loading size="large" />}>
              <KEGGModulesAnalysis />
            </Suspense>
          </RouteForHash>
          <RouteForHash hash="#metagenome-search">
            <div className="vf-stack vf-stack--400">
              <h3>Metagenome Search</h3>
              <p>
                Search for metagenomes similar to this genome using sequence
                similarity.
              </p>

              <button
                type="button"
                className="vf-button vf-button--primary"
                onClick={handleMetagenomeSearch}
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search Metagenomes'}
              </button>

              {isSearching && (
                <div className="vf-u-padding__top--400">
                  <Loading size="small" />
                  <p>Searching for similar metagenomes...</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="vf-u-padding__top--400">
                  <h4>Search Results ({searchResults.length} matches found)</h4>
                  <table className="vf-table">
                    <thead className="vf-table__header">
                      <tr className="vf-table__row">
                        <th className="vf-table__heading" scope="col">
                          Accession
                        </th>
                        <th className="vf-table__heading" scope="col">
                          Type
                        </th>
                        <th className="vf-table__heading" scope="col">
                          Bioproject
                        </th>
                        <th className="vf-table__heading" scope="col">
                          Biosample
                        </th>
                        <th className="vf-table__heading" scope="col">
                          cANI
                        </th>
                        <th className="vf-table__heading" scope="col">
                          Date
                        </th>
                        <th className="vf-table__heading" scope="col">
                          Containment
                        </th>
                        <th className="vf-table__heading" scope="col">
                          Location
                        </th>
                        <th className="vf-table__heading" scope="col">
                          Organism
                        </th>
                      </tr>
                    </thead>
                    <tbody className="vf-table__body">
                      {searchResults.map((result) => (
                        <tr className="vf-table__row" key={result.acc}>
                          <td className="vf-table__cell">{result.acc}</td>
                          <td className="vf-table__cell">
                            {result.assay_type}
                          </td>
                          <td className="vf-table__cell">
                            {result.bioproject}
                          </td>
                          <td className="vf-table__cell">
                            <a
                              href={result.biosample_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Link
                            </a>
                          </td>
                          <td className="vf-table__cell">{result.cANI}</td>
                          <td className="vf-table__cell">
                            {result.collection_date_sam}
                          </td>
                          <td className="vf-table__cell">
                            {result.containment}
                          </td>
                          <td className="vf-table__cell">
                            {result.geo_loc_name_country_calc}
                          </td>
                          <td className="vf-table__cell">{result.organism}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </RouteForHash>
          <RouteForHash hash="#downloads">
            <Downloads endpoint="genomes" accession={accession || ''} />
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default GenomePage;
