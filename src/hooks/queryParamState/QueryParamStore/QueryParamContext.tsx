import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { forOwn, has, isEqual, isNil } from 'lodash-es';
import { useEffectOnce, useFirstMountState } from 'react-use';

export type ParamParser<S> = (raw: string) => S;
export type Serializer<S> = (v: S) => string | null;

export type SharedQueryParam = {
  parser?: ParamParser<any>;
  serializer?: Serializer<any>;
  value?: any;
  defaultValue?: any;
};

export const SharedTextQueryParam: (
  defaultValue: string
) => SharedQueryParam = (defaultValue: string) => {
  return {
    defaultValue: defaultValue,
    parser: (v) => v,
    serializer: (v) => v,
  } as SharedQueryParam;
};

export const SharedNumberQueryParam: (
  defaultValue: number
) => SharedQueryParam = (defaultValue: number) => {
  return {
    defaultValue: defaultValue,
    parser: (v) => parseInt(v as unknown as string, 10),
    serializer: String,
  } as SharedQueryParam;
};

export const SharedNumberRangeQueryParam: (
  defaultValue: [number, number]
) => SharedQueryParam = (defaultValue: [number, number]) => {
  return {
    defaultValue: defaultValue,
    parser: (v) => {
      // TODO in theory this could be non-stringable
      const [min, max] = String(v).split(',').map(Number);
      return [min ?? defaultValue[0], max ?? defaultValue[1]];
    },
    serializer: (v) => {
      const [min, max] = v as unknown as [number, number];
      return `${min},${max}`;
    },
  };
};

export const SharedMultipleValueQueryParam: (
  defaultValue: string[]
) => SharedQueryParam = (defaultValue: string[]) => {
  return {
    defaultValue,
    parser: (v) => {
      // TODO: consider non-simple csv string lists
      return String(v)
        .split(',')
        .map((s) => s.trim());
    },
    serializer: (v) => {
      // TODO: consider escaping
      return v.join(',');
    },
  };
};

export type SharedQueryParamSet = {
  [key: string]: SharedQueryParam;
};

export type SharedQueryParamContextValue = {
  queryParams: SharedQueryParamSet;
  setQueryParams: React.Dispatch<React.SetStateAction<SharedQueryParamSet>>;
};

export const SharedQueryParamContext =
  React.createContext<SharedQueryParamContextValue>({
    queryParams: {},
    setQueryParams: () => {},
  });
SharedQueryParamContext.displayName = 'SharedQueryParams';

const SharedQueryParamsProvider: React.FC<{ params: SharedQueryParamSet }> = ({
  params,
  children,
}) => {
  const [queryParams, setQueryParams] =
    React.useState<SharedQueryParamSet>(params);
  const [searchParams, setSearchParams] = useSearchParams();

  const isFirstMount = useFirstMountState();
  useEffect(() => {
    // Update query params in the address bar if the params meaningfully change
    if (isFirstMount) return; // allow a tick for useEffectOnce to take priority

    // Prevent meaningless state updates if url params are not diff-by-value
    const prev = searchParams.toString();
    const next = new URLSearchParams(searchParams);

    forOwn(queryParams, (paramDef, paramName) => {
      const { serializer, value, defaultValue } = paramDef;
      const currentSerializedValue = next.get(paramName);

      const isNullishOrDefault =
        isNil(value) || isEqual(value, defaultValue) || isEqual(value, '');

      if (isNullishOrDefault) {
        if (next.has(paramName)) {
          next.delete(paramName);
        }
        return;
      }

      const serializedValue = (
        serializer ? serializer(value) : String(value)
      ) as string;

      if (!isEqual(currentSerializedValue, serializedValue)) {
        next.set(paramName, serializedValue);
      }
    });

    const nextStr = next.toString();
    if (nextStr !== prev.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [isFirstMount, queryParams, searchParams, setSearchParams]);

  useEffectOnce(() => {
    // On the first render, set the query params values to any incoming from the address bar
    if (searchParams) {
      const searchParamsValuesToSyncInwards: Record<string, any> = {};
      searchParams.forEach((paramValue, paramName) => {
        if (has(params, paramName)) {
          searchParamsValuesToSyncInwards[paramName] =
            queryParams[paramName].parser?.(paramValue);
        }
      });
      setQueryParams((prev) => {
        const next: SharedQueryParamSet = { ...prev };
        forOwn(searchParamsValuesToSyncInwards, (parsedValue, paramName) => {
          if (has(next, paramName)) {
            next[paramName] = {
              ...next[paramName],
              value: parsedValue,
            };
          }
        });
        return next;
      });
    }
  });

  const setWithLogging = (value) => {
    setQueryParams(value);
  };

  return (
    <SharedQueryParamContext.Provider
      value={{ queryParams, setQueryParams: setWithLogging }}
    >
      {children}
    </SharedQueryParamContext.Provider>
  );
};

export default SharedQueryParamsProvider;
