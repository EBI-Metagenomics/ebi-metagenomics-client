import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash-es';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import './style.css';

type TextInputDebouncedProps = {
  namespace: string;
  placeholder?: string;
};
const TextInputDebounced: React.FC<TextInputDebouncedProps> = ({
  namespace,
  placeholder = 'Enter your search terms',
}) => {
  const [queryParameters, setQueryParameters] = useQueryParametersState({
    [`${namespace}search`]: '',
  });
  const [value, setValue] = useState(
    (queryParameters[`${namespace}search`] as string) || ''
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounced = useCallback(
    debounce((v: string): void => {
      setQueryParameters({
        ...queryParameters,
        [`${namespace}search`]: v,
      });
    }, 300),
    []
  );
  const handleOnChange = (event): void => {
    const v = event.target.value;
    setValue(v);
    debounced(v);
  };
  return (
    <div className="vf-form__item mg-textsearch">
      <label className="vf-form__label vf-search__label" htmlFor="searchitem">
        Filter
      </label>
      <input
        type="search"
        placeholder={placeholder}
        id="searchitem"
        className="vf-form__input"
        onChange={handleOnChange}
        value={value}
      />
    </div>
  );
};

export default TextInputDebounced;
