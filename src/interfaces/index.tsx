import { KeyValue } from 'hooks/data/useData';

export interface PaginatedList<T = unknown> {
  items: T[];
  count: number;
}

export interface EnaDerivedObject extends Record<string, unknown> {
  accession: string;
  ena_accessions: string[];
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
  index_files?: {
    index_type: string;
    relative_url: string;
  }[];
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

export type AnalysisList = PaginatedList<Analysis>;

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
  protein_catalogue_name: string;
  protein_catalogue_description: string;
  updated_at: string;
  result_directory: string;
  genome_count: number;
  unclustered_genome_count: number;
  ftp_url: string;
  pipeline_version_tag: string;
  catalogue_biome_label: string;
  catalogue_type: 'prokaryotes' | 'eukaryotes' | 'viruses' | string;
  other_stats: KeyValue;
  biome: Biome;
}

export interface Genome {
  accession: string;
  ena_genome_accession: string;
  ena_sample_accession: string;
  ncbi_genome_accession: string;
  img_genome_accession: string;
  patric_genome_accession: string;
  length: number;
  num_contigs: number;
  n_50: number;
  gc_content: number;
  type: 'MAG' | 'Isolate' | string;
  completeness: number;
  contamination: number;
  catalogue_id: string;
  geographic_origin: string;
  geographic_range: string[];
  biome: Biome;
}

export type GenomeCatalogueList = PaginatedList<GenomeCatalogue>;

export type GenomeCatalogueDetail = GenomeCatalogue;

export type GenomeList = PaginatedList<Genome>;

export interface GenomeDetail extends Genome {
  downloads: Download[];
  catalogue: GenomeCatalogue;
}

export interface GenomeDetailWithAnnotations {
  accession: string;
  annotations: KeyValue;
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
