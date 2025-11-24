import React, { Suspense, lazy, useState } from 'react';
import axios from 'axios';

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
import EMGTable from 'components/UI/EMGTable';
import getBranchwaterResultColumns from 'components/Branchwater/common/resultColumns';
import useBranchwaterResults, {
  BranchwaterFilters,
} from 'components/Branchwater/common/useBranchwaterResults';
import FiltersBar from 'components/Branchwater/common/FiltersBar';
import ResultsDashboard from 'components/Branchwater/common/ResultsDashboard';

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
  // Branchwater/Metagenome search result type (as returned by the API)
  type BranchwaterResult = {
    acc: string;
    assay_type: string;
    bioproject: string;
    cANI: number | string; // API may return number or numeric string
    containment: number | string; // same as above
    geo_loc_name_country_calc: string;
    organism: string;
    exists_on_mgnify?: boolean;
    // Allow unknown extra fields without resorting to `any`
    [key: string]: unknown;
  };

  const [searchResults, setSearchResults] = useState<BranchwaterResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<BranchwaterFilters>({
    acc: '',
    assay_type: '',
    bioproject: '',
    collection_date_sam: '',
    containment: '',
    geo_loc_name_country_calc: '',
    organism: '',
  });
  const namespace = 'genome-metagenome-search-';
  const results = useBranchwaterResults<BranchwaterResult>({
    items: searchResults,
    namespace,
    pageSize: 25,
    filters,
  });
  const handleFilterChange = (field: keyof BranchwaterFilters, value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const handleMetagenomeSearch = () => {
    if (!data) return;

    const { data: genomeData } = data as MGnifyResponseObj;
    const relatedCat = genomeData.relationships.catalogue as {
      data: { id: string; type: string };
      links: { related: string };
    };

    setIsSearching(true);

    axios
      .post<BranchwaterResult[]>(
        `http://branchwater-dev.mgnify.org/mags?accession=${accession}&catalogue=${relatedCat.data.id}`
      )
      .then(({ responseData }) => {
        setSearchResults(responseData);
        setIsSearching(false);
      })
      .catch(() => {
        setIsSearching(false);
      });
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
    { label: accession ?? '' },
  ];

  if (!accession) return null;

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
                  <h4>Search Results ({results.total} matches found)</h4>

                  <FiltersBar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />

                  <div style={{ overflowX: 'auto' }}>
                    <EMGTable
                      cols={getBranchwaterResultColumns()}
                      data={{
                        items: results.paginatedResults,
                        count: results.total,
                      }}
                      className="vf-table"
                      showPagination
                      expectedPageSize={25}
                      sortable
                      namespace={namespace}
                    />
                  </div>

                  <ResultsDashboard items={results.filteredResults} />
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
