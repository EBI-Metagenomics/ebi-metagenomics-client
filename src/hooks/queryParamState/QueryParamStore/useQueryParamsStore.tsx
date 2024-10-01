import { useContext } from 'react';
import { QueryParamContext } from '@/hooks/queryParamState/QueryParamStore/QueryParamContext';

const useQueryParamsStore = () => useContext(QueryParamContext);
export default useQueryParamsStore;
