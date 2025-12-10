import React, { Suspense, lazy, useContext } from 'react';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import RouteForHash from 'components/Nav/RouteForHash';
import Overview from 'components/Genomes/Overview';
import Downloads from 'components/Downloads/v2index';
import useApiData from '@/hooks/data/useApiData';
import useURLAccession from '@/hooks/useURLAccession';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import UserContext from 'pages/Login/UserContext';
const GenomeBrowser = lazy(() => import('components/Genomes/Browser'));
const GenomeGenericAnalysis = lazy(
  () => import('components/Genomes/Annotations')
);

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
  const { config } = useContext(UserContext);

  type GenomeApiResponse = {
    accession: string;
    ena_genome_accession: string | null;
    ena_sample_accession: string | null;
    ncbi_genome_accession: string | null;
    img_genome_accession: string | null;
    patric_genome_accession: string | null;
    length: number;
    num_contigs: number;
    n_50: number;
    gc_content: number; // 0..1
    type: string; // e.g. "MAG"
    completeness: number;
    contamination: number;
    catalogue_id: string;
    geographic_origin?: string | null;
    geographic_range?: string[] | null;
    biome?: {
      biome_name: string;
      lineage: string;
    } | null;
    downloads?: unknown[];
    catalogue?: {
      catalogue_id: string;
      version: string;
      name: string;
      description: string;
      protein_catalogue_name: string | null;
      protein_catalogue_description: string | null;
      updated_at: string;
      result_directory: string | null;
      genome_count: number;
      unclustered_genome_count: number | null;
      ftp_url: string;
      pipeline_version_tag: string;
      catalogue_biome_label: string;
      catalogue_type: string;
      other_stats: unknown;
      biome: {
        biome_name: string;
        lineage: string;
      };
    } | null;
  };

  const { data, loading, error } = useApiData<GenomeApiResponse>({
    // url: accession ? `${config.api_v2}/genomes/${accession}` : null,
    url: accession ? `${config.api_v2}/genomes/MGYG000000001` : null,
  });

  const genomeAnnotationsData = useApiData({
    url: accession ? `${config.api_v2}/genomes/${accession}/annotations` : null,
  });

  console.log('genomeAnnotationsData ', genomeAnnotationsData);

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const catalogueId = data.catalogue?.catalogue_id || data.catalogue_id;
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    {
      label: 'Genomes',
      url: '/browse/genomes',
    },
    {
      label: catalogueId,
      url: `/genome-catalogues/${catalogueId}`,
    },
    { label: accession ?? '' },
  ];

  if (!accession) return null;

  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Genome {accession}</h2>
      <p>
        <b>Type:</b> {data.type}
      </p>
      {/*TODO: Put back when taxon lineage is  made available on endpoint*/}
      {/*<p>*/}
      {/*  <b>Taxonomic lineage:</b>{' '}*/}
      {/*  {cleanTaxLineage(*/}
      {/*    data.biome?.lineage || '',*/}
      {/*    ' > '*/}
      {/*  )}*/}
      {/*</p>*/}
      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <RouteForHash hash="#overview" isDefault>
            <Overview data={data} />
          </RouteForHash>
          <RouteForHash hash="#genome-browser">
            <Suspense fallback={<Loading size="large" />}>
              <GenomeBrowser />
            </Suspense>
          </RouteForHash>
          <RouteForHash hash="#cog-analysis">
            <Suspense fallback={<Loading size="large" />}>
              <GenomeGenericAnalysis
                items={genomeAnnotationsData.data?.annotations.cog_categories}
                chartTitle="Top 10 COG categories"
                subtitleSuffix="Genome COG matches"
                tooltipEntityLabel="COG"
                tableType="cog"
                tableTitlePrefix="COG categories"
                labelAccessor={(d: any) => String(d.name)}
                dataCy="genome-cog-analysis"
              />
            </Suspense>
          </RouteForHash>
          <RouteForHash hash="#kegg-class-analysis">
            <Suspense fallback={<Loading size="large" />}>
              <GenomeGenericAnalysis
                items={genomeAnnotationsData.data?.annotations.kegg_classes}
                chartTitle="Top 10 KEGG brite categories"
                subtitleSuffix="KEGG matches"
                tooltipEntityLabel="KEGG Class"
                tableType="kegg-class"
                tableTitlePrefix="KEGG classes"
                labelAccessor={(d: any) =>
                  String((d as any).class_id ?? (d as any).name)
                }
                dataCy="genome-kegg-analysis"
              />
            </Suspense>
          </RouteForHash>
          <RouteForHash hash="#kegg-module-analysis">
            <Suspense fallback={<Loading size="large" />}>
              <GenomeGenericAnalysis
                items={genomeAnnotationsData.data?.annotations.kegg_modules}
                chartTitle="Top 10 KEGG module categories"
                subtitleSuffix="KEGG module matches"
                tooltipEntityLabel="KEGG Module"
                tableType="kegg-module"
                tableTitlePrefix="KEGG modules"
                labelAccessor={(d: any) => String(d.name)}
                firstColumnHeaderOverride="Module ID"
                dataCy="genome-kegg-module-analysis"
              />
            </Suspense>
          </RouteForHash>
          <RouteForHash hash="#downloads">
            <Downloads downloads={data.downloads} />
          </RouteForHash>
        </div>
      </section>
    </section>
  );
};

export default GenomePage;
