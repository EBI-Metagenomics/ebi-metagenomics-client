import React from 'react';
import { Asterisk } from 'lucide-react';

import './style.css';

type WildcardSearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  wholeWord: boolean;
  onWholeWordChange: (wholeWord: boolean) => void;
};

const WildcardSearchInput: React.FC<WildcardSearchInputProps> = ({
  wholeWord,
  onWholeWordChange,
  ...inputProps
}) => {
  const inputValue = String(inputProps.value ?? '');
  const showWildcards = !wholeWord && Boolean(inputValue);
  const title = wholeWord
    ? 'Whole-word search. Click for wildcard (partial word) search.'
    : 'Wildcard search. Click to match whole words only.';
  const toggleProps = {
    'aria-label': title,
    'aria-pressed': !wholeWord,
    className: 'wildcard-search-input__toggle',
    disabled: inputProps.disabled,
    onClick: () => onWholeWordChange(!wholeWord),
    title,
    type: 'button' as const,
  };

  return (
    <div className="wildcard-search-input">
      <div
        className="wildcard-search-input__field"
        data-wildcard={showWildcards || undefined}
      >
        <input {...inputProps} type="search" className="vf-form__input" />
        {showWildcards && (
          <span className="wildcard-search-input__wildcards" aria-hidden="true">
            *<span>{inputValue}</span>*
          </span>
        )}
      </div>
      <button {...toggleProps}>
        <Asterisk aria-hidden="true" strokeWidth={3} />
      </button>
    </div>
  );
};

export default WildcardSearchInput;
