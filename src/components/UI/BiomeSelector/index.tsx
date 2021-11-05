/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState } from 'react';

import { groupBy, split, map, flatMap, find } from 'lodash-es';
import Select from 'react-select';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseList, MGnifyDatum } from 'hooks/data/useData';
import { getBiomeIcon } from 'utils/biomes';

type BiomeSelectorProps = {
  onSelect: (lineage: string) => void;
  initialValue?: string;
};

type OptionProps = {
  value: MGnifyDatum | string;
  label: string | number | Record<string, unknown> | [];
};

const OptionLabel: React.FC<OptionProps> = ({ value, label }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <div style={{ display: 'flex' }}>
      <span
        className={`biome_icon icon_xxs ${getBiomeIcon(
          typeof value === 'string' ? value : value.id
        )}`}
        style={{ float: 'initial' }}
      />
    </div>
    <div>{label}</div>
  </div>
);

const BiomeSelector: React.FC<BiomeSelectorProps> = ({
  onSelect,
  initialValue,
}) => {
  const { data: biomes, loading } = useMGnifyData(
    'biomes/root/children?depth_gte=1&depth_lte=3&page_size=100'
  );
  const [value, setValue] = useState<OptionProps | undefined>();
  const options = React.useMemo(() => {
    if (loading) {
      return [{ label: 'Loading...', value: 'root' }];
    }
    const groupedLineages = groupBy(
      (biomes as MGnifyResponseList).data,
      (biome) => split(biome.id.replace('root:', ''), ':', 1).join(':')
    );
    return map(groupedLineages, (childBiomes, lineageLabel) => ({
      label: lineageLabel,
      options: childBiomes.map((biome) => ({
        value: biome,
        label:
          lineageLabel === biome.attributes['biome-name']
            ? `All ${lineageLabel}`
            : biome.attributes['biome-name'],
      })),
    }));
  }, [biomes, loading]);

  useEffect(() => {
    if (initialValue && options?.length && !loading) {
      setValue(
        find(flatMap(options, 'options'), (o) => {
          return o.value.id === initialValue;
        })
      );
    }
  }, [initialValue, options, loading]);

  return (
    <Select
      theme={(theme) => ({
        ...theme,
        borderRadius: 0,
        border: '2px solid grey',
        colors: {
          ...theme.colors,
          primary: 'var(--vf-color--blue--dark)',
          primary25: 'var(--vf-color--blue--light)',
          primary50: 'var(--vf-color--blue--light)',
          primary75: 'var(--vf-color--blue)',
          neutral0: 'var(--vf-color--neutral--0)',
          neutral5: 'var(--vf-color--neutral--100)',
          neutral10: 'var(--vf-color--neutral--100)',
          neutral20: 'var(--vf-color--neutral--200)',
          neutral30: 'var(--vf-color--neutral--300)',
          neutral40: 'var(--vf-color--neutral--400)',
          neutral50: 'var(--vf-color--neutral--500)',
          neutral60: 'var(--vf-color--neutral--600)',
          neutral70: 'var(--vf-color--neutral--700)',
          neutral80: 'var(--vf-color--neutral--800)',
          neutral90: 'var(--vf-color--neutral--900)',
          danger: 'var(--vf-color--red)',
          dangerLight: 'var(--vf-color--red--light)',
        },
      })}
      styles={{
        control: (provided, state) => ({
          ...provided,
          border: state.isFocused
            ? '2px solid var(--vf-color--grey--dark)'
            : '2px solid var(--vf-color--grey)',
          boxShadow: state.isFocused
            ? '0 0 0 .0625rem var(--vf-color--grey--dark)'
            : 'unset',
          '&:hover': {
            border: '2px solid var(--vf-color--grey--dark)',
            boxShadow: '0 0 0 .0625rem var(--vf-color--grey--dark)',
          },
          color: state.isFocused
            ? 'var(--vf-color--grey--dark)'
            : 'var(--vf-color--grey)',
        }),
      }}
      placeholder="Filter by biome"
      value={value}
      onChange={(option, action) => {
        if (action.action === 'select-option') {
          setValue(option);
          onSelect(
            typeof option.value === 'string' ? option.value : option.value.id
          );
        }
      }}
      formatOptionLabel={OptionLabel}
      isLoading={loading}
      isSearchable
      name="biome"
      options={options}
    />
  );
};

export default BiomeSelector;
