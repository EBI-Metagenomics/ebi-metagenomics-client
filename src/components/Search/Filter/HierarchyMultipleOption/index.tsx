import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';
import LoadingOverlay from 'components/UI/LoadingOverlay';

import 'styles/filters.css';
import './style.css';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';
import { remove } from 'lodash-es';

interface OptionDataType {
  value: string;
  label: string;
  count: number;
  optionChildren?: OptionDataType[];

  children?: OptionDataType[];
}
interface HierarchyOptionProps extends OptionDataType {
  depth?: number;
  shouldExpand: (value: string) => boolean;
  handleSelection: (evt: {
    target: {
      value?: string;
      checked?: boolean;
    };
  }) => void;
  isSelected: (value: string) => boolean;
}
const HierarchyOption: React.FC<HierarchyOptionProps> = ({
  value,
  label,
  count,
  optionChildren,
  depth = 0,
  shouldExpand,
  handleSelection,
  isSelected,
}) => {
  const [displayChildren, setDisplayChildren] = useState(shouldExpand(value));
  return (
    <div
      style={{
        marginLeft: `${depth * 0.5}rem`,
      }}
    >
      <div className="mg-hierarchy-selector">
        {optionChildren?.length ? (
          <button
            type="button"
            className="mg-expander"
            onClick={() => setDisplayChildren(!displayChildren)}
          >
            {displayChildren ? '▾' : '▸'}
          </button>
        ) : (
          <span className="mg-hierarchy-spacer" />
        )}
        <div className="vf-form__item vf-form__item--checkbox">
          <input
            type="checkbox"
            name={value}
            value={value}
            id={value}
            className="vf-form__checkbox"
            onChange={handleSelection}
            checked={isSelected(value)}
          />
          <label className="vf-form__label" htmlFor={value}>
            <span className="mg-filter-checkbox-label">
              {label} <span className="mg-number">{count}</span>
            </span>
          </label>
        </div>
      </div>
      {optionChildren &&
        optionChildren.length &&
        displayChildren &&
        optionChildren.map(
          ({
            label: childLabel,
            value: childValue,
            count: childCount,
            children: childChildren,
          }) => (
            <HierarchyOption
              key={`${value}/${childValue}`}
              label={childLabel}
              value={`${value}/${childValue}`}
              count={childCount}
              depth={depth + 1}
              optionChildren={childChildren}
              handleSelection={handleSelection}
              isSelected={isSelected}
              shouldExpand={shouldExpand}
            />
          )
        )}
    </div>
  );
};

type MultipleOptionProps = {
  facetName: string;
  header: string;
};

const HierarchyMultipleOptionFilter: React.FC<MultipleOptionProps> = ({
  facetName,
  header,
}) => {
  const { pathname } = useLocation();
  const { searchData } = useContext(SearchQueryContext);
  const [facet, setFacet] = useQueryParamState<string[]>(facetName);
  const [selected, setSelected] = useState(facet.filter(Boolean));
  useEffect(() => {
    setSelected(facet.filter(Boolean));
  }, [facet]);

  const facetData = useMemo(() => {
    const cleanedFacetData = (
      searchData?.[pathname]?.data?.facets || []
    ).filter((f) => f.id === facetName)?.[0];
    if (cleanedFacetData?.id === 'biome') {
      // Do not show objects tagged to "root" biome.
      remove(cleanedFacetData.facetValues, ['value', 'root']);
    }
    return cleanedFacetData;
  }, [pathname, searchData, facetName]);

  if (searchData?.[pathname].error) return null;

  if (!facetData)
    return (
      <LoadingOverlay loading={searchData?.[pathname].loading}>
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
                  setFacet([]);
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
    setFacet(newSelected.sort());
  };

  return (
    <LoadingOverlay loading={searchData?.[pathname].loading}>
      <fieldset className="vf-form__fieldset vf-stack vf-stack--200">
        <legend className="vf-form__legend">{header}</legend>
        {facetData.facetValues.map(({ label, value, count, children }) => (
          <HierarchyOption
            key={value}
            label={label}
            value={value}
            count={count}
            optionChildren={children}
            handleSelection={handleSelection}
            isSelected={(v) => selected.includes(v)}
            shouldExpand={(v) => selected.some((s) => s.startsWith(v))}
          />
        ))}
      </fieldset>
    </LoadingOverlay>
  );
};

export default HierarchyMultipleOptionFilter;
