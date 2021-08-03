import { useState, useEffect, useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

const useQueryParamState: <S>(
  parameter: string,
  defaultValue: S
) => [string | S, (s: S) => void] = (parameter, defaultValue) => {
  const location = useLocation();
  const history = useHistory();
  const parameters = new URLSearchParams(location.search);
  const [value, setValue] = useState(parameters.get(parameter) || defaultValue);

  // The Query parameters have changed, so we need to update the value if needed.
  useEffect(() => {
    const changedParameters = new URLSearchParams(location.search);
    if (changedParameters.get(parameter) === value) return;
    setValue(changedParameters.get(parameter) || defaultValue);
  }, [location.search, defaultValue, parameter, value]);

  // Pushes the new URL(including the new parameter value) into history
  const setParameterInURL: (newValue: unknown) => void = (newValue) => {
    if (String(newValue) === String(value)) return;
    const parametersToChange = new URLSearchParams(location.search);
    parametersToChange.set(parameter, String(newValue));
    // The default value is not displayed in the URL
    if (newValue === defaultValue) {
      parametersToChange.delete(parameter);
    }
    location.search = parametersToChange.toString();
    history.push(location);
  };

  return [value, setParameterInURL];
};

type QueryState = {
  [parameter: string]: unknown;
};
type SerializersType = {
  [parameter: string]: (str: string) => unknown;
};

const getQueryStateFromURL = (
  state: QueryState,
  searchStr: string,
  serializers: SerializersType
): QueryState => {
  const innerState = {};
  const parametersFromURL = new URLSearchParams(searchStr);
  Object.entries(state).forEach(([parameter, value]) => {
    const serializer = serializers[parameter] || String;
    innerState[parameter] = serializer(
      parametersFromURL.get(parameter) || (value as string)
    );
  });
  return innerState;
};
export const useQueryParametersState: (
  initialState: QueryState,
  serializers?: SerializersType
) => [QueryState, (s: QueryState) => void] = (
  initialState,
  serializers = {}
) => {
  const location = useLocation();
  const history = useHistory();
  const stateWithURL = useMemo(
    () => getQueryStateFromURL(initialState, location.search, serializers),
    [initialState, location.search, serializers]
  );
  const [currentState, setCurrentState] = useState(stateWithURL);

  // The Query parameters have changed, so we need to update the value if needed.
  useEffect(() => {
    const newState = getQueryStateFromURL(
      initialState,
      location.search,
      serializers
    );
    if (JSON.stringify(newState) === JSON.stringify(currentState)) return;
    setCurrentState(newState);
  }, [location.search, currentState, initialState, serializers]);

  // Pushes the new URL(including the new parameter value) into history
  const setParametersInURL: (newState: QueryState) => void = (newState) => {
    if (JSON.stringify(newState) === JSON.stringify(currentState)) return;
    const parametersToChange = new URLSearchParams(location.search);

    let changed = false;
    Object.entries(initialState).forEach(([parameter, defaultValue]) => {
      const newValue =
        parameter in newState ? newState[parameter] : defaultValue;
      if (newState[parameter] !== currentState[parameter]) {
        parametersToChange.set(parameter, String(newValue));
        if (newValue === defaultValue) {
          parametersToChange.delete(parameter);
        }
        changed = true;
      }
    });

    // The default value is not displayed in the URL
    if (changed) {
      location.search = parametersToChange.toString();
      history.push(location);
    }
  };

  return [currentState, setParametersInURL];
};

export default useQueryParamState;
