import { KeyValue } from 'hooks/data/useData';

export interface PaginatedList {
  items: unknown[];
  count: number;
}

export interface EnaDerivedObject extends Record<string, unknown> {
  accession?: string;
  ena_accessions: string[];
}

export interface Biome {
  biome_name: string;
  lineage: string;
}

export interface Download {
  download_group: string;
  alias: string;
  download_type: string;
  file_type: string;
  long_description: string;
  short_description: string;
  url: string;
}

export interface Run extends EnaDerivedObject {
  instrument_model: string | null;
  instrument_platform: string | null;
}

export interface Analysis {
  study_accession: string;
  accession: string;
  run: Run | null;
  sample: EnaDerivedObject | null;
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

export interface AnalysisList extends PaginatedList {
  items: Analysis[];
}

export interface Study extends EnaDerivedObject {
  title: string;
  biome: Biome;
  updated_at: string;
}

export interface StudyList extends PaginatedList {
  items: Study[];
}

export interface StudyDetail extends Study {
  downloads: Download[];
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

export interface GenomeCatalogueList extends PaginatedList {
  items: GenomeCatalogue[];
}

export type GenomeCatalogueDetail = GenomeCatalogue;

export interface GenomeList extends PaginatedList {
  items: Genome[];
}

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

export interface SuperStudyList extends PaginatedList {
  items: SuperStudy[];
}

export interface SuperStudyDetail extends SuperStudy {
  flagship_studies: Study[];
  related_studies: Study[];
  genome_catalogues: GenomeCatalogue[];
}
