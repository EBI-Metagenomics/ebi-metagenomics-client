import React, { memo } from 'react';
import TextInputDebounced from 'components/UI/TextInputDebounced';

type ContigTextFilterProps = {
  title: string;
  placeholder: string;
};

const ContigTextFilter: React.FC<ContigTextFilterProps> = ({
  title,
  placeholder,
}) => {
  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--200 mg-contig-text-filter">
      <legend className="vf-form__legend">{title}</legend>
      <TextInputDebounced
        namespace={`${title.replaceAll(' ', '_').toLowerCase()}_`}
        placeholder={placeholder}
      />
    </fieldset>
  );
};
export default memo(ContigTextFilter);
