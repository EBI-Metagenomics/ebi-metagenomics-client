import React, { useEffect, useState } from 'react';
import './style.css';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';
import { useDebounce } from 'react-use';

type TextInputDebouncedProps = {
  namespace: string;
  placeholder?: string;
};
const TextInputDebounced: React.FC<TextInputDebouncedProps> = ({
  namespace,
  placeholder = 'Enter your search terms',
}) => {
  const [searchParam, setSearchParam] = useQueryParamState(
    `${namespace}search`,
    ''
  );
  const [value, setValue] = useState(searchParam || '');

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
  }, [debouncedValue, setSearchParam]);

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
