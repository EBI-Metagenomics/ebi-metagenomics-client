import { merge } from 'lodash-es';
// import config from 'config.json';
import config from '../../config.json';
// import privateConfig from 'config.private.json';
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
    baseUrl: string;
    siteId: number;
  };
  jupyterLabURL: string;
  magsPipelineRepo: string;
  whenDownloadingListsFromApi?: {
    maxPages: number;
    cadenceMs: number;
  };
};

export default merge(config, privateConfig || {});
