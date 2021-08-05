import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';
import Loading from 'components/UI/Loading';
import 'styles/filters.css';

const CentreNameFilter: React.FC = () => {
  const location = useLocation();
  const { searchData, queryParameters, setQueryParameters } =
    useContext(SearchQueryContext);
  const [selected, setSelected] = useState(
    (queryParameters.centre_name as string).split(',').filter(Boolean)
  );
  useEffect(() => {
    setSelected(
      (queryParameters.centre_name as string).split(',').filter(Boolean)
    );
  }, [queryParameters.centre_name]);

  const facetData = useMemo(
    () =>
      (searchData?.[location.pathname]?.data?.facets || []).filter(
        (f) => f.id === 'centre_name'
      )?.[0],
    [location.pathname, searchData]
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
      centre_name: newSelected.sort().join(','),
    });
  };

  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--400">
      <legend className="vf-form__legend">Centre name</legend>
      {facetData.facetValues.map(({ label, value, count }) => (
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

export default CentreNameFilter;
