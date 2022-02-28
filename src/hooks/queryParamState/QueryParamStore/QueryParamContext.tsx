import React, { Dispatch } from 'react';
import {
  createParamFromURL,
  GlobalState,
  ParamActions,
  queryParamsReducer,
} from 'hooks/queryParamState/QueryParamStore/queryParamReducer';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { mapValues, omitBy } from 'lodash-es';
import { useDebounce, useEffectOnce } from 'react-use';

export const initialParamsState = {
  params: {},
};

type QueryParamContext = {
  state: GlobalState;
  dispatch: Dispatch<ParamActions>;
};

export const QueryParamContext = React.createContext<QueryParamContext>({
  state: initialParamsState,
  dispatch: () => null,
});
QueryParamContext.displayName = 'QueryParams';

const QueryParamsProvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(
    queryParamsReducer,
    initialParamsState
  );
  const [urlParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  useDebounce(
    () => {
      const newParams = new URLSearchParams(
        mapValues(
          omitBy(
            state.params,
            (parm) =>
              parm.value === parm.defaultValue || parm.value === undefined
          ),
          'value'
        ) as Record<string, string>
      );
      location.search = newParams.toString();
      navigate(location);
    },
    50,
    [state.params]
  );

  useEffectOnce(() => {
    urlParams.forEach((value, name) => {
      dispatch(createParamFromURL({ name, value }));
    });
  });

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <QueryParamContext.Provider value={{ state, dispatch }}>
      {children}
    </QueryParamContext.Provider>
  );
};

export default QueryParamsProvider;
