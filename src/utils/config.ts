import config from 'config.json';

export type ConfigType = {
  api: string;
  ebisearch: string;
  website: string;
  blog: string;
  basename: string;
  enaURL: string;
  googleMapsKey: string;
};

const mergePrivateConfig = (callback: (x: ConfigType) => void): void => {
  import('config.private.json')
    .then((privateConfig) => callback({ ...config, ...privateConfig.default }))
    .catch(() => callback(config));
};

export default mergePrivateConfig;
