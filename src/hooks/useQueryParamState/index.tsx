import { useState, useEffect } from 'react';
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

export default useQueryParamState;
