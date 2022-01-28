import React, { memo, useContext, useEffect, useState } from 'react';
import ContigsQueryContext from 'components/Analysis/ContigViewer/ContigsQueryContext';

const TYPES = ['COG', 'KEGG', 'GO', 'Pfam', 'InterPro', 'antiSMASH'];

const ContigAnnotationTypeFilter: React.FC = () => {
  const { queryParameters, setQueryParameters } =
    useContext(ContigsQueryContext);

  const [selected, setSelected] = useState(
    (queryParameters.annotation_type as string).split(',').filter(Boolean)
  );

  useEffect(() => {
    setSelected(
      (queryParameters.annotation_type as string).split(',').filter(Boolean)
    );
  }, [queryParameters.annotation_type]);

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
      annotation_type: newSelected.sort().join(','),
    });
  };
  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--400 mg-contig-text-filter">
      <legend className="vf-form__legend">Show contigs with:</legend>
      {TYPES.map((annotationType) => {
        const id = annotationType.toLowerCase();
        return (
          <div className="vf-form__item vf-form__item--checkbox" key={id}>
            <input
              type="checkbox"
              name={annotationType}
              value={annotationType.toLowerCase()}
              id={annotationType.toLowerCase()}
              className="vf-form__checkbox"
              onChange={handleSelection}
              checked={selected.includes(id)}
            />
            <label className="vf-form__label" htmlFor={id}>
              <span className="mg-filter-checkbox-label">{annotationType}</span>
            </label>
          </div>
        );
      })}
    </fieldset>
  );
};
export default memo(ContigAnnotationTypeFilter);
