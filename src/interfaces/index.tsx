import { KeyValue } from "hooks/data/useData";

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

export interface Run extends EnaDerivedObject{
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
