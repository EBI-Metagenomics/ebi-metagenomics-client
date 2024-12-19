export interface Download {
  alias: string;
  download_type: string;
  file_type: string;
  long_description: string;
  short_description: string;
  url: string;
}

export interface AnalysisDetail {
  study_accession: string;
  accession: string;
  downloads: Download[];
  run_accession: string;
  sample_accession: string;
  assembly_accession: string | null;
  experiment_type: string;
  instrument_model: string | null;
  instrument_platform: string | null;
  pipeline_version: string;
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
