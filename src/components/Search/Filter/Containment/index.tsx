import React, { memo, useMemo } from 'react';

import Slider from 'components/UI/Slider';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';

const MIN = 0;
const MAX = 1;

interface ContainmentFilterProps {
  queryParamKey?: string;
}

const ContainmentFilter: React.FC<ContainmentFilterProps> = ({
  queryParamKey = 'containment',
}) => {
  const [containment, setContainment] = useQueryParamState(queryParamKey, '');

  const range = useMemo(() => {
    const parts = containment?.split(',').map(Number);
    if (parts?.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { min: parts[0], max: parts[1] };
    }
    return { min: MIN, max: MAX };
  }, [containment]);

  const handleSlider = ({ min, max }): void => {
    setContainment(`${min},${max}`);
  };

  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--200 mg-temperature-filter">
      <legend className="vf-form__legend">Containment</legend>
      <div className="mg-switch-and-slider">
        <Slider
          min={MIN}
          max={MAX}
          steps={1000}
          precision={2}
          isEnabled
          selection={range}
          onChange={handleSlider}
        />
      </div>
    </fieldset>
  );
};

export default memo(ContainmentFilter);
