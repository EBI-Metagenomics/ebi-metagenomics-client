import { KeyValue } from 'hooks/data/useData';

export interface PaginatedList<T = unknown> {
  items: T[];
  count: number;
}

export interface EnaDerivedObject extends Record<string, unknown> {
  accession: string;
  ena_accessions: string[];
  first_accession: string;
}

export interface Biome {
  biome_name: string;
  lineage: string;
}

export type BiomeList = PaginatedList<Biome>;

export interface Download {
  download_group: string;
  alias: string;
  download_type: string;
  file_type: string;
  long_description: string;
  short_description: string;
  url: string;
  index_file?: {
    index_type: string;
    path?: string;
    url?: string;
  } | null;
  index_files?:
    | {
        index_type: string;
        url: string;
      }[]
    | null;
}

export interface Sample extends EnaDerivedObject {
  sample_title: string;
  biome?: Biome;
  updated_at?: string;
}

export type SampleList = PaginatedList<Sample>;

export interface StudySample extends Sample {
  metadata?: Record<string, any>;
}

export interface SampleDetail extends Sample {
  metadata?: Record<string, any>;
  studies?: Study[];
}

export interface Run extends EnaDerivedObject {
  instrument_model: string | null;
  instrument_platform: string | null;
}

export interface RunDetail extends Run {
  experiment_type: string;
  sample_accession: string;
  study_accession: string;
  sample: Sample;
  study: Study;
}

export type RunList = PaginatedList<Run>;

export interface Analysis {
  study_accession: string;
  accession: string;
  run: Run | null;
  sample: Sample | null;
  assembly: EnaDerivedObject | null;
  experiment_type: string;
  pipeline_version: string;
}

export interface AnalysisDetail extends Analysis {
  downloads: Download[];
  read_run: Run | null;
  quality_control_summary: KeyValue;
  metadata: KeyValue;
  results_dir: string;
}

type Taxonomy = Array<{
  count: number;
  description: string | null;
  organism: string;
}>;

export interface AnalysisDetailWithAnnotations extends AnalysisDetail {
  taxonomy_lsu_count: number;
  taxonomy_ssu_count: number;
  its_one_db_count: number;
  its_unite_count: number;
  annotations: {
    taxonomies: {
      lsu: Taxonomy | null;
      ssu: Taxonomy | null;
      unite: Taxonomy | null;
      its_one_db: Taxonomy | null;
    };
  };
}

export interface AnalysisList extends PaginatedList<Analysis> {}
export interface Assembly extends EnaDerivedObject {
  updated_at: string;
  run_accession: string;
  sample_accession: string;
  reads_study_accession: string;
  assembly_study_accession: string;
  assembler_name: string;
  assembler_version: string;
  metadata?: {
    coverage?: number;
    coverage_depth?: number;
  };
  experiment_type: string;
  wgs_accession: string;
  legacy_accession: string;
  pipelines: string[];
}
export type AssemblyList = PaginatedList<Assembly>;

export interface Study extends EnaDerivedObject {
  title: string;
  biome: Biome;
  updated_at: string;
  metadata?: Record<string, any>;
}

export type StudyList = PaginatedList<Study>;

export interface StudyDetail extends Study {
  downloads: Download[];
  metadata: KeyValue;
}

export interface GenomeCatalogue extends Record<string, unknown> {
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
  catalogue_type: 'prokaryotes' | 'eukaryotes' | 'viruses' | string;
  other_stats: KeyValue;
  biome: Biome;
  downloads: Download[];
}

export interface Genome {
  accession: string;
  ena_genome_accession: string | null;
  ena_sample_accession: string | null;
  ncbi_genome_accession: string | null;
  img_genome_accession: string | null;
  patric_genome_accession: string | null;
  length: number;
  num_contigs: number;
  n_50: number;
  gc_content: number;
  type: 'MAG' | 'Isolate' | string;
  completeness: number;
  contamination: number;
  catalogue_id: string;
  geographic_origin: string | null;
  geographic_range: string[] | null;
  biome: Biome | null;
  num_genomes_total?: number;
  taxon_lineage?: string;
  updated_at?: string;
}

export interface GenomeApiResponse extends Genome {
  downloads?: Download[];
  catalogue?: GenomeCatalogue | null;
}

export type GenomeCatalogueList = PaginatedList<GenomeCatalogue>;

export type GenomeCatalogueDetail = GenomeCatalogue;

export type GenomeList = PaginatedList<Genome>;

export interface GenomeDetail extends Genome {
  downloads: Download[];
  catalogue: GenomeCatalogue;
}

export type GenomeAnnotation = {
  count: number;
  description: string | null;
  name?: string;
  class_id?: string;
};

export interface GenomeDetailWithAnnotations {
  accession: string;
  annotations: {
    cog_categories: GenomeAnnotation[];
    kegg_classes: GenomeAnnotation[];
    kegg_modules: GenomeAnnotation[];
  };
}

export interface SuperStudy {
  slug: string;
  title: string;
  description: string;
  logo_url: string;
}

export type SuperStudyList = PaginatedList<SuperStudy>;

export interface SuperStudyDetail extends SuperStudy {
  flagship_studies: Study[];
  related_studies: Study[];
  genome_catalogues: GenomeCatalogue[];
}

export interface PublicationMetadata {
  authors: string;
  doi?: string;
  iso_journal?: string;
  pub_type?: string;
  pubmed_central_id?: number;
  isbn?: string;
  volume?: string | number;
  [key: string]: string | number | undefined;
}

export interface Publication {
  pubmed_id: number;
  title: string;
  published_year: number;
  metadata: PublicationMetadata;
}

export type PublicationList = PaginatedList<Publication>;

export interface PublicationStudy {
  accession: string;
  ena_accessions: string[];
  title: string;
  biome: Biome;
  updated_at: string;
}

export interface PublicationDetail extends Publication {
  studies: PublicationStudy[];
}

export interface PublicationEuropePmcCore extends Record<string, unknown> {
  version: number;
  hit_count: number;
  result: {
    abstractText: string;
    [key: string]: unknown;
  };
}

type Tag = {
  name: string;
  uri: string;
};

type Mention = {
  exact: string;
  id: string;
  postfix: string;
  prefix: string;
  provider: string;
  section: string;
  type: string;
  tags: Tag[];
};

type Annotation = {
  annotation_text: string;
  mentions: Mention[];
};

export type AnnotationGroup = {
  annotation_type: string;
  description: string;
  title: string;
  annotations: Annotation[];
};

export type PublicationEuropePmcAnnotations = {
  other: AnnotationGroup[];
  sample_processing: AnnotationGroup[];
};

export interface ViralCatalogue {
  catalogue_id: string;
  name: string;
  version: string;
  description: string;
  biome: string;
  ftp_url: string;
  pipeline_version: string;
  updated_at: string;
  fragment_count: number;
  total_sequence_count?: number;
  cluster_count: number;
  virus_count: number;
  provirus_count: number;
  prophage_count: number;
  plasmid_count: number | null;
  downloads: Download[];
  other_stats: Record<string, unknown>;
}

export interface ViralFragmentOccurrence {
  fragment_accession: string;
  nt_sequence_sha256: string;
  original_id: string;
  prediction_tool?: string;
  source_type: 'genome' | 'analysis';
  source_accession: string;
  source_genome_accession: string | null;
  catalogue_genome_id: number | null;
  genome_catalogue_id: string | null;
  analysis_id: number | null;
  analysis_accession: string | null;
  source_sample: string;
  source_study: string;
  source_lineage: string;
}

export interface ViralFragment {
  accession: string;
  catalogue_id: string;
  original_id: string;
  cluster_representative: string;
  length: number;
  sequence_sha256: string;
  nt_sequence_sha256?: string;
  cluster_size?: number;
  occurrence_count?: number;
  cluster_member_occurrence_count?: number;
  source_types?: ('genome' | 'analysis')[];
  occurrences?: ViralFragmentOccurrence[];
  cluster_member_occurrences?: ViralFragmentOccurrence[];
  source_type: 'genome' | 'analysis';
  source_accession: string;
  source_genome_accession: string | null;
  source_analysis_accession: string | null;
  source_sample: string;
  source_study: string;
  source_lineage: string;
  prediction_tool: string;
  checkv_quality: string;
  miuvig_quality: string;
  completeness: number | null;
  contamination: number | null;
  is_provirus: boolean;
  sequence_type: 'virus' | 'prophage';
  taxonomy: Record<string, string>;
  metadata?: Record<string, string>;
}
