import React, { memo, useState } from 'react';

import Slider from 'components/UI/Slider';
import Switch from 'components/UI/Switch';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';

const MIN = 0;
const MAX = 2000;

const DepthFilter: React.FC = () => {
  const [depth, setDepth] = useQueryParamState<[number, number]>('depth');
  const [enabled, setEnabled] = useState(!!depth);

  const handleSwitch = (isEnabled: boolean): void => {
    setEnabled(isEnabled);
    if (!isEnabled) {
      setDepth([MIN, MAX]);
    }
  };
  const handleSlider = ({ min, max }): void => {
    setDepth([min, max]);
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
            min: depth?.[0] || MIN,
            max: depth?.[1] || MAX,
          }}
          onChange={handleSlider}
        />
      </div>
    </fieldset>
  );
};
export default memo(DepthFilter);
