import config from 'config.json';
import privateConfig from 'config.private.json';

export type ConfigType = {
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
  jupyterLabURL: string;
  magsPipelineRepo: string;
};

export default { ...config, ...(privateConfig || {}) };
