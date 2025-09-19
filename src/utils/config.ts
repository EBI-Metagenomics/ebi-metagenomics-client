// import config from 'config.json';
import config from 'config.json';
// import privateConfig from 'config.private.json';
import privateConfig from 'config.private.json';
import { merge } from 'lodash-es';

export type ConfigType = {
  hmmer: string | (() => void);
  api: string;
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
};

export default merge(config, privateConfig || {});
