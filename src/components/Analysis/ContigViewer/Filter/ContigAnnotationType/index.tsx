import React, { memo, useEffect, useState } from 'react';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';

const TYPES = ['COG', 'KEGG', 'GO', 'Pfam', 'InterPro', 'antiSMASH'];

const ContigAnnotationTypeFilter: React.FC = () => {
  const [annotationType, setAnnotationType] = useQueryParamState(
    'annotation_type',
    ''
  );

  const [selected, setSelected] = useState(
    annotationType.split(',').filter(Boolean)
  );

  useEffect(() => {
    setSelected(annotationType.split(',').filter(Boolean));
  }, [annotationType]);

  const handleSelection = (event): void => {
    const { value, checked: isChecked } = event.target as HTMLInputElement;
    let newSelected = [...selected];
    if (isChecked && !selected.includes(value)) {
      newSelected.push(value);
    } else {
      newSelected = selected.filter((s) => s !== value);
    }
    setAnnotationType(newSelected.sort().join(','));
  };
  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--200 mg-contig-text-filter">
      <legend className="vf-form__legend mg-contig-filter">
        Show contigs with:
      </legend>
      {TYPES.map((aT) => {
        const id = aT.toLowerCase();
        return (
          <div className="vf-form__item vf-form__item--checkbox" key={id}>
            <input
              type="checkbox"
              name={aT}
              value={aT.toLowerCase()}
              id={aT.toLowerCase()}
              className="vf-form__checkbox"
              onChange={handleSelection}
              checked={selected.includes(id)}
            />
            <label className="vf-form__label" htmlFor={id}>
              <span className="mg-filter-checkbox-label">{aT}</span>
            </label>
          </div>
        );
      })}
    </fieldset>
  );
};
export default memo(ContigAnnotationTypeFilter);
