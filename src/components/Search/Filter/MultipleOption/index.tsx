import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';
import Loading from 'components/UI/Loading';
import 'styles/filters.css';

type MultipleOptionProps = {
  facetName: string;
  header: string;
  includeTextFilter?: boolean;
};
const MultipleOptionFilter: React.FC<MultipleOptionProps> = ({
  facetName,
  header,
  includeTextFilter = false,
}) => {
  const location = useLocation();
  const { searchData, queryParameters, setQueryParameters } =
    useContext(SearchQueryContext);
  const [selected, setSelected] = useState(
    (queryParameters[facetName] as string).split(',').filter(Boolean)
  );
  const [textFilter, setTextFilter] = useState('');
  useEffect(() => {
    setSelected(
      (queryParameters[facetName] as string).split(',').filter(Boolean)
    );
  }, [queryParameters, facetName]);

  const facetData = useMemo(
    () =>
      (searchData?.[location.pathname]?.data?.facets || []).filter(
        (f) => f.id === facetName
      )?.[0],
    [location.pathname, searchData, facetName]
  );

  if (searchData?.[location.pathname].loading) return <Loading />;
  if (searchData?.[location.pathname].error) return null;

  if (!facetData) return null;
  const handleSelection = (event): void => {
    const { value, checked: isChecked } = event.target as HTMLInputElement;
    let newSelected = [...selected];
    if (isChecked && !selected.includes(value)) {
      newSelected.push(value);
    } else {
      newSelected = selected.filter((s) => s !== value);
    }
    setQueryParameters({
      ...queryParameters,
      [facetName]: newSelected.sort().join(','),
    });
  };

  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--400">
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
      {facetData.facetValues
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
              id={value}
              className="vf-form__checkbox"
              onChange={handleSelection}
              checked={selected.includes(value)}
            />
            <label className="vf-form__label" htmlFor={value}>
              <span className="mg-filter-checkbox-label">
                {label} <span className="mg-number">{count}</span>
              </span>
            </label>
          </div>
        ))}
    </fieldset>
  );
};
export default MultipleOptionFilter;
