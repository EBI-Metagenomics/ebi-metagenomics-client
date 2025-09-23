import React, { memo, useCallback } from 'react';
import TextInputTypeahead, {
  KEYWORD_ANY,
} from 'components/UI/TextInputTypeahead';
import {
  getTypeaheadSuggestions,
  TypeAheadAttributes,
} from 'utils/locallyIndexedGff';
import Switch from 'components/UI/Switch';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import { camelCase } from 'lodash-es';
import 'styles/filters.css';

type ContigTypeaheadFilterProps = {
  title: string;
  attribute: TypeAheadAttributes;
  placeholder: string;
};

const ContigTypeaheadFilter: React.FC<ContigTypeaheadFilterProps> = ({
  title,
  attribute,
  placeholder,
}) => {
  const namespace = `${title.replaceAll(' ', '_').toLowerCase()}_`;
  const getSuggestions = useCallback(
    async (query: string): Promise<string[]> => {
      return await getTypeaheadSuggestions(query, attribute, 10);
    },
    [attribute]
  );
  const [searchParam, setSearchParam] = useQueryParamState<string>(
    camelCase(`${namespace} search`)
  );

  const handleSwitch = () => {
    setSearchParam(searchParam === KEYWORD_ANY ? '' : KEYWORD_ANY);
  };

  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--200 mg-contig-text-filter">
      <TextInputTypeahead
        namespace={namespace}
        placeholder={placeholder}
        getSuggestions={getSuggestions}
        title={title}
      />
      <div className="mg-switch-and-slider">
        <Switch
          id={`contig_required_switch_${attribute}`}
          onChange={handleSwitch}
          isOn={searchParam === KEYWORD_ANY}
          controlled
        />
        <p className="vf-form__helper">Filter by presence</p>
      </div>
    </fieldset>
  );
};

export default memo(ContigTypeaheadFilter);
