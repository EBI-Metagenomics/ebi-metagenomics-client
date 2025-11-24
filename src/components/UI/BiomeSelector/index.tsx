import React, { useEffect, useState } from 'react';

import { countBy, filter, find, flatMap, groupBy, map, split } from 'lodash-es';
import Select from 'react-select';
import { getBiomeIcon } from '@/utils/biomes';
import {
  reactSelectStyles,
  reactSelectTheme,
} from 'styles/react-select-styles';
import useSharedQueryParamState from '@/hooks/queryParamState/useQueryParamState';
import useBiomes from 'hooks/data/useBiomes';
import { Biome } from '@/interfaces';

type BiomeSelectorProps = {
  onSelect: (lineage: string) => void;
  lineageFilter?: (lineage: string) => boolean;
};

type OptionProps = {
  value: Biome | string;
  label: string | number | Record<string, unknown> | [];
};

const OptionLabel: React.FC<OptionProps> = ({ value, label }) => (
  <div className="vf-flag vf-flag--middle vf-flag--200">
    <div className="vf-flag__media">
      <span
        className={`biome_icon icon_xxs ${getBiomeIcon(
          typeof value === 'string' ? value : value.lineage
        )}`}
        style={{ float: 'initial' }}
      />
    </div>
    <div className="vf-flag__body">{label}</div>
  </div>
);

const BiomeSelector: React.FC<BiomeSelectorProps> = ({
  onSelect,
  lineageFilter = () => true,
}) => {
  const { data: biomes, loading } = useBiomes({ page_size: 200 });
  const [biomeQP, setBiomeQP] = useSharedQueryParamState<string>('biome');
  const [value, setValue] = useState<OptionProps | null>();
  const options = React.useMemo(() => {
    if (loading) {
      return [{ label: 'Loading...', value: 'root' }];
    }
    const filteredBiomes = filter(biomes?.items ?? [], (biome) =>
      lineageFilter(biome.lineage as string)
    );
    const groupedLineages = groupBy(filteredBiomes, (biome) =>
      split(biome.lineage.replace('root:', ''), ':', 1).join(':')
    );
    return map(groupedLineages, (childBiomes, lineageLabel) => ({
      label: lineageLabel,
      options: childBiomes.map((biome) => ({
        value: biome,
        label: `${countBy(biome.lineage)[':'] >= 2 ? '↳  ' : ''}${
          lineageLabel === biome.biome_name
            ? `All ${lineageLabel}`
            : biome.biome_name
        }
            `,
      })),
    }));
  }, [biomes, loading, lineageFilter]);

  useEffect(() => {
    if (biomeQP && options?.length && !loading && !value) {
      const optionForQueryParam = find(flatMap(options, 'options'), (o) => {
        return o.value.id === biomeQP;
      });
      setValue(optionForQueryParam);
    }
  }, [options, loading, biomeQP, value]);

  return (
    <div style={{ flexGrow: 1, maxWidth: '320px' }}>
      <label className="vf-form__label" htmlFor="biome-select">
        Filter biome
      </label>
      <Select
        theme={reactSelectTheme}
        styles={reactSelectStyles}
        placeholder="Filter by biome"
        value={value}
        onChange={(option, action) => {
          if (action.action === 'select-option') {
            setValue(option);
            if (!option) return;
            const biomeId =
              typeof option.value === 'string'
                ? option.value
                : option.value.lineage;
            onSelect(biomeId);
            setBiomeQP(biomeId);
          }
        }}
        formatOptionLabel={OptionLabel}
        isLoading={loading}
        isSearchable
        name="biome"
        inputId="biome-select"
        options={options}
      />
    </div>
  );
};

export default BiomeSelector;
