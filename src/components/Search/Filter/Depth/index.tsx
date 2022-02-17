import React, { useEffect, useState, useContext, memo } from 'react';

import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';

import Slider from 'components/UI/Slider';
import Switch from 'components/UI/Switch';

const MIN = 0;
const MAX = 2000;

const DepthFilter: React.FC = () => {
  const { queryParameters, setQueryParameters } =
    useContext(SearchQueryContext);
  const [enabled, setEnabled] = useState(!!queryParameters.depth);
  const [range, setRange] = useState(
    (queryParameters.depth as string).split(',').filter(Boolean).map(Number)
  );
  useEffect(() => {
    const newRange = (queryParameters.depth as string)
      .split(',')
      .filter(Boolean)
      .map(Number);
    setRange(newRange);
  }, [queryParameters.depth]);

  const handleSwitch = (isEnabled: boolean): void => {
    setEnabled(isEnabled);
    if (!isEnabled) {
      setQueryParameters({
        ...queryParameters,
        depth: '',
      });
    }
  };
  const handleSlider = ({ min, max }): void => {
    setQueryParameters({
      ...queryParameters,
      depth: `${min},${max}`,
    });
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
