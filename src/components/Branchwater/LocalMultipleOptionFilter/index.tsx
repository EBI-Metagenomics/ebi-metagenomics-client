import React, { useMemo, useState } from 'react';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';
import useSharedQueryParamState from '@/hooks/queryParamState/useQueryParamState';

interface LocalMultipleOptionFilterProps {
  facetName: string;
  header: string;
  data: any[];
  includeTextFilter?: boolean;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
}

const LocalMultipleOptionFilter: React.FC<LocalMultipleOptionFilterProps> = ({
  facetName,
  header,
  data,
  includeTextFilter = false,
  filterValue,
  onFilterChange,
}) => {
  const [facet, setFacet] = useSharedQueryParamState<string[]>(facetName);
  // const [facet, setFacet] = useQueryParamState(facetName, '');
  const selected = useMemo(() => {
    if (filterValue !== undefined) {
      return filterValue.split(',').filter(Boolean);
    }
    return facet?.split(',').filter(Boolean) || [];
  }, [filterValue, facet]);

  const [textFilter, setTextFilter] = useState('');

  // Generate facet data from your search results
  const facetData = useMemo(() => {
    const counts: Record<string, number> = {};

    data.forEach((item) => {
      const value = item[facetName];
      if (value && value !== 'NP') {
        const key = String(value);
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([value, count]) => ({
        label: value,
        value,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [data, facetName]);

  const handleSelection = (event): void => {
    const { value, checked: isChecked } = event.target as HTMLInputElement;
    let newSelected = [...selected];
    if (isChecked && !selected.includes(value)) {
      newSelected.push(value);
    } else {
      newSelected = selected.filter((s) => s !== value);
    }
    const facetValue = newSelected.sort().join(',');

    if (onFilterChange) {
      onFilterChange(facetValue);
    } else {
      setFacet(facetValue);
    }
  };

  return (
    <FixedHeightScrollable className="mg-filter" heightPx={600}>
      <fieldset className="vf-form__fieldset vf-stack vf-stack--200">
        <legend className="vf-form__legend">{header}</legend>

        {includeTextFilter && (
          <input
            type="text"
            placeholder="Filter the list"
            className="vf-form__input"
            value={textFilter}
            onChange={(evt) => setTextFilter(evt.target.value)}
          />
        )}

        {facetData
          .filter(
            ({ label, value }) =>
              textFilter === '' ||
              label.toLowerCase().includes(textFilter.toLowerCase()) ||
              value.toLowerCase().includes(textFilter.toLowerCase())
          )
          .map(({ label, value, count }) => (
            <div className="vf-form__item vf-form__item--checkbox" key={value}>
              <input
                type="checkbox"
                name={value}
                value={value}
                id={`${facetName}-${value}`}
                className="vf-form__checkbox"
                onChange={handleSelection}
                checked={selected?.includes(value)}
              />
              <label
                className="vf-form__label"
                htmlFor={`${facetName}-${value}`}
              >
                <span className="mg-filter-checkbox-label">
                  {label} <span className="mg-number">{count}</span>
                </span>
              </label>
            </div>
          ))}
      </fieldset>
    </FixedHeightScrollable>
  );
};

export default LocalMultipleOptionFilter;
