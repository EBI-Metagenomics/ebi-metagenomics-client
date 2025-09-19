import React, { memo, useEffect, useState } from 'react';

import Slider from 'components/UI/Slider';
import Switch from 'components/UI/Switch';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';

const MIN = 0;
const MAX = 2000;

const DepthFilter: React.FC = () => {
  const [depth, setDepth] = useQueryParamState('depth', '');
  const [enabled, setEnabled] = useState(!!depth);
  const [range, setRange] = useState(
    (depth as string).split(',').filter(Boolean).map(Number)
  );
  useEffect(() => {
    const newRange = (depth as string).split(',').filter(Boolean).map(Number);
    setRange(newRange);
  }, [depth]);

  const handleSwitch = (isEnabled: boolean): void => {
    setEnabled(isEnabled);
    if (!isEnabled) {
      setDepth('');
    }
  };
  const handleSlider = ({ min, max }): void => {
    setRange([min, max]);
    setDepth(`${min},${max}`);
  };
  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--200 mg-depth-filter">
      <legend className="vf-form__legend">Depth (meters)</legend>
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
export default memo(DepthFilter);
