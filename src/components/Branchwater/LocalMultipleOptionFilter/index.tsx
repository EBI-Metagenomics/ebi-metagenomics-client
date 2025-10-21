// Create a new component: LocalMultipleOptionFilter.tsx
import React, { useMemo, useState, useEffect } from 'react';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';

interface LocalMultipleOptionFilterProps {
  facetName: string;
  header: string;
  data: any[]; // Your searchResults array
  includeTextFilter?: boolean;
}

const LocalMultipleOptionFilter: React.FC<LocalMultipleOptionFilterProps> = ({
  facetName,
  header,
  data,
  includeTextFilter = false,
}) => {
  const [facet, setFacet] = useQueryParamState(facetName, '');
  const [selected, setSelected] = useState(facet.split(',').filter(Boolean));
  const [textFilter, setTextFilter] = useState('');

  useEffect(() => {
    setSelected(facet.split(',').filter(Boolean));
  }, [facet]);

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
    setFacet(newSelected.sort().join(','));
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
                checked={selected.includes(value)}
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
