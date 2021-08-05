import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';
import Loading from 'components/UI/Loading';
import './style.css';
import 'styles/filters.css';

interface BiomeDataType {
  value: string;
  label: string;
  count: number;
  biomeChildren?: BiomeDataType[];
}
interface BiomeProps extends BiomeDataType {
  depth?: number;
  handleSelection: (evt: {
    target: {
      value?: string;
      checked?: boolean;
    };
  }) => void;
  isSelected: (value: string) => boolean;
}
const Biome: React.FC<BiomeProps> = ({
  value,
  label,
  count,
  biomeChildren,
  depth = 0,
  handleSelection,
  isSelected,
}) => {
  const [displayChildren, setDisplayChildren] = useState(false);
  return (
    <div
      style={{
        marginLeft: `${depth}rem`,
      }}
    >
      <div className="mg-biome-selector">
        {biomeChildren?.length ? (
          <button
            type="button"
            className="mg-expander"
            onClick={() => setDisplayChildren(!displayChildren)}
          >
            {displayChildren ? '▾' : '▸'}
          </button>
        ) : (
          <span className="mg-biome-spacer" />
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
      {biomeChildren &&
        biomeChildren.length &&
        displayChildren &&
        biomeChildren.map(
          ({
            label: childLabel,
            value: childValue,
            count: childCount,
            biomeChildren: childChildren,
          }) => (
            <Biome
              key={`${value}/${childValue}`}
              label={childLabel}
              value={`${value}/${childValue}`}
              count={childCount}
              depth={depth + 1}
              biomeChildren={childChildren}
              handleSelection={handleSelection}
              isSelected={isSelected}
            />
          )
        )}
    </div>
  );
};

const BiomesFilter: React.FC = () => {
  const location = useLocation();
  const { searchData, queryParameters, setQueryParameters } =
    useContext(SearchQueryContext);
  const [selected, setSelected] = useState(
    (queryParameters.biome as string).split(',').filter(Boolean)
  );
  useEffect(() => {
    setSelected((queryParameters.biome as string).split(',').filter(Boolean));
  }, [queryParameters.biome]);

  const facetData = useMemo(
    () =>
      (searchData?.[location.pathname]?.data?.facets || []).filter(
        (f) => f.id === 'biome'
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
      biome: newSelected.sort().join(','),
    });
  };

  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--400">
      <legend className="vf-form__legend">Biome</legend>
      {facetData.facetValues.map(({ label, value, count, children }) => (
        <Biome
          key={value}
          label={label}
          value={value}
          count={count}
          biomeChildren={children}
          handleSelection={handleSelection}
          isSelected={(v) => selected.includes(v)}
        />
      ))}
    </fieldset>
  );
};

export default BiomesFilter;
