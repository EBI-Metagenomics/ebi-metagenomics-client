import { MultiValue } from 'react-select';
import {
  reactSelectStyles,
  reactSelectTheme,
} from 'styles/react-select-styles';
import React, { ReactElement, useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';
import Switch from 'components/UI/Switch';
import { kebabCase } from 'lodash-es';

type FieldMultipleTextQueryProps = {
  fieldName: string;
  header: string;
  example: string;
  queryMatcher: RegExp;
  queryMustInclude?: string;
  explainer?: ReactElement | HTMLElement | string;
};

type SelectOptions = MultiValue<{ value: string; label: string }>;

const AND = 'AND';
const OR = 'OR';

const FieldMultipleTextQuery: React.FC<FieldMultipleTextQueryProps> = ({
  fieldName,
  header,
  example,
  queryMatcher,
  queryMustInclude,
  explainer,
}) => {
  const [searchQuery, setSearchQuery] = useQueryParamState(fieldName, '');

  const [queryTexts, setQueryTexts] = useState<SelectOptions>(
    searchQuery
      ?.match(queryMatcher)
      ?.map((term) => ({ value: term, label: term })) || []
  );
  const [logicalOperator, setLogicalOperator] = useState<string>(
    searchQuery.includes(OR) ? OR : AND
  );

  const handleLogicSwitch = (isAnd: boolean): void => {
    setLogicalOperator(isAnd ? AND : OR);
  };

  useEffect(() => {
    if (!searchQuery) {
      // param cleared in url
      setQueryTexts([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!queryTexts.length) {
      setSearchQuery('');
      return;
    }
    const combinedQueries = queryTexts
      .map((q) => q.value)
      .join(` ${logicalOperator} `);
    setSearchQuery(combinedQueries);
  }, [queryTexts, logicalOperator, setSearchQuery]);

  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--200">
      <legend className="vf-form__legend">
        {header}
        {!!explainer && <p className="vf-form__helper">{explainer}</p>}
        <div className="mg-switch-and-slider">
          <Switch
            id={`${kebabCase(header)}-logic-switch`}
            onChange={handleLogicSwitch}
            isOn={logicalOperator === AND}
            extraClass="mg-logical-operator-switch"
          />
          <p
            className="vf-form__helper"
            style={{
              lineHeight: '1em',
              paddingLeft: '4px',
              paddingBottom: '4px',
            }}
          >
            of these should be present:
          </p>
        </div>
      </legend>
      <CreatableSelect
        theme={reactSelectTheme}
        styles={reactSelectStyles}
        placeholder={`Enter ${header} queries`}
        value={queryTexts}
        onChange={setQueryTexts}
        name="biome"
        inputId={`${kebabCase(header)}-multi-query`}
        isMulti
        options={queryTexts as SelectOptions}
        noOptionsMessage={() => example}
        formatCreateLabel={(term) => `Add "${term}" to search query`}
        isValidNewOption={(term) => {
          return queryMustInclude ? term.includes(queryMustInclude) : true;
        }}
      />
    </fieldset>
  );
};

export default FieldMultipleTextQuery;
