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
