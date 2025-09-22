import React, { useEffect, useState } from 'react';
import './style.css';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';
import { useDebounce } from 'react-use';
import { camelCase } from 'lodash-es';

type TextInputDebouncedProps = {
  namespace: string;
  placeholder?: string;
};
const TextInputDebounced: React.FC<TextInputDebouncedProps> = ({
  namespace,
  placeholder = 'Enter your search terms',
}) => {
  const [searchParam, setSearchParam] = useQueryParamState<string>(camelCase(`${namespace} search`));
  const [value, setValue] = useState<string>(searchParam || '');

  const [debouncedValue, setDebouncedValue] = React.useState('');

  useDebounce(
    () => {
      setDebouncedValue(value);
    },
    300,
    [value]
  );

  useEffect(() => {
    setSearchParam(debouncedValue);
  }, [debouncedValue]);

  const handleOnChange = (event): void => {
    const v = event.target.value;
    setValue(v);
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
