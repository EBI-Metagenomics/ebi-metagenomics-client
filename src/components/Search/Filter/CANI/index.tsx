import React, { useEffect, useState, memo } from 'react';

import Slider from 'components/UI/Slider';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';

const MIN = 0;
const MAX = 1;

// A slider-based filter for cANI (calculated ANI) without a toggle
// Persists selection to the `cani` query parameter as "min,max"
const CANIFilter: React.FC = () => {
  const [cani, setCani] = useQueryParamState('cani', '');
  const [range, setRange] = useState<number[]>(
    cani
      .split(',')
      .filter(Boolean)
      .map(Number)
  );

  useEffect(() => {
    const newRange = cani
      .split(',')
      .filter(Boolean)
      .map(Number);
    setRange(newRange);
  }, [cani]);

  const handleSlider = ({ min, max }): void => {
    setRange([min, max]);
    setCani(`${min},${max}`);
  };

  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--200 mg-temperature-filter">
      <legend className="vf-form__legend">cANI</legend>
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

export default memo(CANIFilter);
