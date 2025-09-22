import React, { useEffect, useState, memo } from 'react';

import Slider from 'components/UI/Slider';
import Switch from 'components/UI/Switch';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';

const MIN = -20;
const MAX = 100;

const TemperatureFilter: React.FC = () => {
  const [temperature, setTemperature] = useQueryParamState<string>('temperature');
  const [enabled, setEnabled] = useState(!!temperature);
  const [range, setRange] = useState(
    temperature.split(',').filter(Boolean).map(Number)
  );
  useEffect(() => {
    const newRange = temperature.split(',').filter(Boolean).map(Number);
    setRange(newRange);
  }, [temperature]);

  const handleSwitch = (isEnabled: boolean): void => {
    setEnabled(isEnabled);
    if (!isEnabled) {
      setTemperature('');
    }
  };
  const handleSlider = ({ min, max }): void => {
    setRange([min, max]);
    setTemperature(`${min},${max}`);
  };
  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--200 mg-temperature-filter">
      <legend className="vf-form__legend">Temperature (°C)</legend>
      <div className="mg-switch-and-slider">
        <Switch id="temp_filter" onChange={handleSwitch} isOn={enabled} />
        <Slider
          min={MIN}
          max={MAX}
          isEnabled={enabled}
          selection={{
            min: range?.[0] || MIN,
            max: range?.[1] || MAX,
          }}
          onChange={handleSlider}
        />
      </div>
    </fieldset>
  );
};
export default memo(TemperatureFilter);
