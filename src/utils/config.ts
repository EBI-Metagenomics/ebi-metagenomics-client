import { merge } from 'lodash-es';
import config from '../../config.json';
import privateConfig from '../../config.private.json';

export type ConfigType = {
  hmmer: string | (() => void);
  api: string;
  api_v2: string;
  ebisearch: string;
  website: string;
  blog: string;
  basename: string;
  enaURL: string;
  googleMapsKey: string;
  featureFlags?: {
    [feature: string]: boolean;
  };
  matomo: {
    urlBase: string;
    siteId: number;
  };
  jupyterLabURL: string;
  magsPipelineRepo: string;
  whenDownloadingListsFromApi?: {
    maxPages: number;
    cadenceMs: number;
  };
  pipelines: {
    [version: string]: {
      [experimentType: string]: {
        githubs: string[];
        workflowHubs: string[];
        docs: string[];
      };
    };
  };
};

export default merge(
  config,
  privateConfig || {},
  import.meta.env
    ? {
        basename: import.meta.env.BASE_URL, // overrides config AND privateConfig,
        googleMapsKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
      }
    : {}
);
