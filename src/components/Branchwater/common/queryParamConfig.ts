import {
  SharedTextQueryParam,
  SharedQueryParamSet,
} from '@/hooks/queryParamState/QueryParamStore/QueryParamContext';

export const branchwaterQueryParamConfig: SharedQueryParamSet = {
  query: SharedTextQueryParam(''),
  cani: SharedTextQueryParam(''),
  containment: SharedTextQueryParam(''),
  geoLocNameCountryCalc: SharedTextQueryParam(''),
  organism: SharedTextQueryParam(''),
  assayType: SharedTextQueryParam(''),
};

export const getPrefixedBranchwaterConfig = (
  namespace: string,
  config: SharedQueryParamSet = branchwaterQueryParamConfig
) => {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      namespace
        ? key.startsWith(namespace)
          ? key
          : `${namespace}${key.charAt(0).toUpperCase()}${key.slice(1)}`
        : key,
      value,
    ])
  );
};
