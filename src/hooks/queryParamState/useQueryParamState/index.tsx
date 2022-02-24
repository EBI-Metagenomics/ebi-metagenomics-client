import { Dispatch, useState } from 'react';
import useQueryParamsStore from 'hooks/queryParamState/QueryParamStore/useQueryParamsStore';
import { useEffectOnce } from 'react-use';
import {
  GlobalState,
  Param,
  ParamActions,
  subscribeToParam,
  unsubscribeFromParam,
  updateParam,
} from 'hooks/queryParamState/QueryParamStore/queryParamReducer';
import { v4 as uuidv4 } from 'uuid';

type StateExtras = {
  param: Param;
  globalState: GlobalState;
  actionDispatcher: Dispatch<ParamActions>;
};

const useQueryParamState: <S>(
  parameter: string,
  defaultValue: S,
  serializer?: (stringified: string) => S | string
) => [S | string, (s: S) => void, StateExtras] = (
  parameter,
  defaultValue,
  serializer = String
) => {
  const { state, dispatch } = useQueryParamsStore();
  const { params } = state;

  const value = serializer(params[parameter]?.value) || defaultValue;
  const [subscriber] = useState(() => uuidv4());

  useEffectOnce(() => {
    dispatch(
      subscribeToParam({
        name: parameter,
        defaultValue,
        serializer,
        subscriber,
      })
    );
    return () => {
      dispatch(unsubscribeFromParam({ name: parameter, subscriber }));
    };
  });

  const setter = (newValue) => {
    if ((newValue as string) === value) return;
    dispatch(updateParam({ name: parameter, value: newValue }));
  };

  return [
    value,
    setter,
    {
      param: params[parameter],
      globalState: state,
      actionDispatcher: dispatch,
    },
  ];
};

export default useQueryParamState;
