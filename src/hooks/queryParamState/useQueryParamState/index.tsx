import SharedQueryParamsProvider, {
  SharedNumberQueryParam,
  SharedQueryParamContext,
  SharedQueryParamSet,
  SharedTextQueryParam,
} from '@/hooks/queryParamState/QueryParamStore/QueryParamContext';
import React, { useContext } from 'react';
import { camelCase, forEach, upperFirst } from 'lodash-es';


function useSharedQueryParamState<T>(
  parameter: string,
): readonly [T, (next: T) => void] {
  const { queryParams, setQueryParams } = useContext(SharedQueryParamContext);

  return [
    (queryParams[parameter]?.value as unknown as T ) ?? queryParams[parameter]?.defaultValue as T ?? (undefined as unknown as T),
    (next: T) => {
      setQueryParams((prev: SharedQueryParamSet) => ({
        ...prev,
        [parameter]: { ...(prev?.[parameter] ?? {}), value: next },
      }));
    },
  ];
}

export default useSharedQueryParamState;

type Hook = <T = unknown>() => readonly [T, (next: T) => void];

// Map the param keys in P to their hook names
type HookName<K extends string> = `use${Capitalize<K>}`;

type HooksFor<P extends SharedQueryParamSet> = {
  [K in keyof P as HookName<Extract<K, string>>]: Hook;
};

export function createSharedQueryParamContext<P extends SharedQueryParamSet>(
  params: P
): {
  QueryParamProvider: React.FC<{ children: React.ReactNode }>;
  withQueryParamProvider: <Q extends object>(Component: React.ComponentType<Q>) => React.FC<Q>;
} & HooksFor<P> {
  const hooks: Partial<HooksFor<P>> = {};

  forEach(params, (_val, paramName) => {
    const name = paramName as keyof P & string;
    const hookName = `use${upperFirst(name)}` as HookName<typeof name>;
    // Assign into the partial map
    // eslint-disable-next-line react-hooks/rules-of-hooks,prettier/prettier
    (hooks as any)[hookName] = (<T = unknown>() => useSharedQueryParamState<T>(name));
  });

  const QueryParamProvider: React.FC<{
    children: React.ReactNode;
  }> = ({ children }) => {
    return (
      <SharedQueryParamsProvider params={params}>{children}</SharedQueryParamsProvider>
    )
  }

  const withQueryParamProvider = <Q extends object>(Component: React.ComponentType<Q>): React.FC<Q> => {
    const Wrapped: React.FC<Q> = (props) => (
      <QueryParamProvider>
        <Component {...props} />
      </QueryParamProvider>
    );
    Wrapped.displayName = `WithQueryParams(${Component.displayName ?? Component.name ?? 'Component'})`;
    return Wrapped;
  };

  return {
    ...(hooks as unknown as HooksFor<P>),
    QueryParamProvider,
    withQueryParamProvider,
  } as {
    QueryParamProvider: React.FC<{ children: React.ReactNode }>;
    withQueryParamProvider: <Q extends object>(Component: React.ComponentType<Q>) => React.FC<Q>;
  } & HooksFor<P>;
}

type BaseContext = ReturnType<typeof createSharedQueryParamContext>;

export function createSharedQueryParamContextForTable(
  namespace: string = '',
  extraParams?: SharedQueryParamSet,
  initialPageSize: number = 10,
  initialOrder: string = ''
): BaseContext {
  return createSharedQueryParamContext({
    [camelCase(`${namespace} page`)]: SharedNumberQueryParam(1),
    [camelCase(`${namespace} page size`)]: SharedNumberQueryParam(initialPageSize),
    [camelCase(`${namespace} order`)]: SharedTextQueryParam(initialOrder),
    [camelCase(`${namespace} search`)]: SharedTextQueryParam(''),
    ...extraParams,
  });
}