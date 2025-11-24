import React, { useEffect, useRef, useState } from 'react';
import './style.css';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import { useDebounce } from 'react-use';
import { camelCase } from 'lodash-es';

export const KEYWORD_ANY = 'ANY' as const;

type TextInputTypeaheadProps = {
  namespace: string;
  placeholder?: string;
  title?: string;
  getSuggestions?: (query: string) => Promise<string[]>;
};

const TextInputTypeahead: React.FC<TextInputTypeaheadProps> = ({
  namespace,
  placeholder = 'Enter your search terms',
  title = 'Filter',
  getSuggestions,
}) => {
  const [searchParam, setSearchParam] = useQueryParamState<string>(
    camelCase(`${namespace} search`)
  );
  const [value, setValue] = useState<string>(searchParam || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] =
    useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (getSuggestions && value.trim() && value.length >= 2) {
      getSuggestions(value.trim())
        .then((results) => {
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
          setActiveSuggestionIndex(-1);
        })
        .catch(() => {
          setSuggestions([]);
          setShowSuggestions(false);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, getSuggestions]);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const v = event.target.value;
    setValue(v);
  };

  const handleSuggestionClick = (suggestion: string): void => {
    setValue(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (
          activeSuggestionIndex >= 0 &&
          activeSuggestionIndex < suggestions.length
        ) {
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

  const handleBlur = (): void => {
    setTimeout(() => {
      const next = document.activeElement;
      const container = suggestionsRef.current;

      if (
        container &&
        typeof (container as any).contains === 'function' &&
        next instanceof Node
      ) {
        const inside = container === next || (container as any).contains(next);
        if (!inside) {
          setShowSuggestions(false);
          setActiveSuggestionIndex(-1);
        }
      }
    }, 150);
  };

  return (
    <div className="vf-form__item mg-textsearch mg-typeahead">
      <label
        className="vf-form__label vf-search__label"
        htmlFor={`searchitem-${namespace}`}
      >
        {title}
      </label>
      <div className="mg-typeahead-container">
        <input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          id={`searchitem-${namespace}`}
          className="vf-form__input"
          onChange={handleOnChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          value={value}
          disabled={searchParam === KEYWORD_ANY}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="mg-typeahead-suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                role="button"
                key={suggestion}
                tabIndex={0}
                className={`mg-typeahead-suggestion ${
                  index === activeSuggestionIndex ? 'active' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSuggestionClick(suggestion);
                  }
                }}
                onMouseEnter={() => setActiveSuggestionIndex(index)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextInputTypeahead;
