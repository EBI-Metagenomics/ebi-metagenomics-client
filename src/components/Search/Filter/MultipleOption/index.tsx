import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';
import LoadingOverlay from 'components/UI/LoadingOverlay';
import useEBISearchData from 'hooks/data/useEBISearchData';

import 'styles/filters.css';
import Loading from 'src/components/UI/Loading';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

const location2endpoint = {
  '/search/studies': 'metagenomics_projects',
  '/search/samples': 'metagenomics_samples',
  '/search/analyses': 'metagenomics_analyses',
};
const INCREMENT = 100;

type MultipleOptionProps = {
  facetName: string;
  header: string;
  includeTextFilter?: boolean;
  sortFn?: (a: unknown, b: unknown) => number;
};
const MultipleOptionFilter: React.FC<MultipleOptionProps> = ({
  facetName,
  header,
  includeTextFilter = false,
  sortFn = undefined,
}) => {
  const location = useLocation();
  const { searchData } = useContext(SearchQueryContext);
  const [facet, setFacet] = useQueryParamState(facetName, '');
  const [selected, setSelected] = useState(facet.split(',').filter(Boolean));
  const [textFilter, setTextFilter] = useState('');
  const [sizeToLoad, setSizeToLoad] = useState(0);
  const { data, loading } = useEBISearchData(
    sizeToLoad > 0 ? location2endpoint[location.pathname] || null : null,
    {
      query: `domain_source:${location2endpoint[location.pathname] || ''}`,
      size: 0,
      facetcount: sizeToLoad,
      facetfields: facetName,
    }
  );

  useEffect(() => {
    setSelected(facet.split(',').filter(Boolean));
  }, [facet]);

  const [facetData, facetSize] = useMemo(() => {
    const tmpFacet = (
      (data || searchData?.[location.pathname]?.data)?.facets || []
    ).filter((f) => f.id === facetName)?.[0];
    const tmpData = tmpFacet?.facetValues;
    const tmpFacetSize = tmpFacet?.total;
    if (tmpData && typeof sortFn === 'function') {
      tmpData.sort(sortFn);
    }
    return [tmpData, tmpFacetSize];
  }, [location.pathname, searchData, facetName, sortFn, data]);

  if (searchData?.[location.pathname].error) return null;

  if (!facetData)
    return (
      <LoadingOverlay loading={searchData?.[location.pathname].loading}>
        <fieldset className="vf-form__fieldset vf-stack vf-stack--200">
          <legend className="vf-form__legend">{header}</legend>
          <p className="vf-form__helper">
            Displayed data is not filterable by {header}
            {!!facet && (
              <button
                className="vf-button vf-button--sm vf-button--link"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFacet('');
                }}
              >
                <span className="icon icon-common icon-times-circle" /> Clear{' '}
                {header} filter
              </button>
            )}
          </p>
        </fieldset>
      </LoadingOverlay>
    );

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
    // <section className="mg-filter">
    <FixedHeightScrollable className="mg-filter" heightPx={600}>
      <LoadingOverlay loading={searchData?.[location.pathname].loading}>
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
              <div
                className="vf-form__item vf-form__item--checkbox"
                key={value}
              >
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
          {facetData.length < facetSize && (
            <div className="mg-right">
              <sup>
                * Showing {facetData.length} out of {facetSize} entries
              </sup>
              <button
                type="button"
                className="vf-button vf-button--sm vf-button--tertiary"
                onClick={() => setSizeToLoad(sizeToLoad + INCREMENT)}
              >
                Load more
              </button>
              {loading && <Loading size="small" />}
            </div>
          )}
        </fieldset>
      </LoadingOverlay>
    </FixedHeightScrollable>
    // {/*</section>*/}
  );
};
export default MultipleOptionFilter;
