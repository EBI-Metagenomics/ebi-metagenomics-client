import React, { useEffect, useState, memo } from 'react';

import Slider from 'components/UI/Slider';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';

const MIN = 0;
const MAX = 1;

// A slider-based filter for Containment, mirroring the cANI filter
// Persists selection to the `containment` query parameter as "min,max"
const ContainmentFilter: React.FC = () => {
  const [containment, setContainment] = useQueryParamState('containment', '');
  const [range, setRange] = useState<number[]>(
    containment?.split(',').filter(Boolean).map(Number)
  );

  useEffect(() => {
    const newRange = containment?.split(',').filter(Boolean).map(Number);
    setRange(newRange);
  }, [containment]);

  const handleSlider = ({ min, max }): void => {
    setRange([min, max]);
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
          precision={3}
          isEnabled
          selection={{
            min: range?.[0] ?? MIN,
            max: range?.[1] ?? MAX,
          }}
          onChange={handleSlider}
        />
      </div>
    </fieldset>
  );
};

export default memo(ContainmentFilter);
