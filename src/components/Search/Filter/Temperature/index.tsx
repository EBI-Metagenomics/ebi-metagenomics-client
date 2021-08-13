import React, { useEffect, useState, useContext, memo } from 'react';

import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';

import Slider from 'src/components/UI/Slider';
import Switch from 'src/components/UI/Switch';

const MIN = -20;
const MAX = 100;

const TemperatureFilter: React.FC = () => {
  const { queryParameters, setQueryParameters } =
    useContext(SearchQueryContext);
  const [enabled, setEnabled] = useState(!!queryParameters.temperature);
  const [range, setRange] = useState(
    (queryParameters.temperature as string)
      .split(',')
      .filter(Boolean)
      .map(Number)
  );
  useEffect(() => {
    const newRange = (queryParameters.temperature as string)
      .split(',')
      .filter(Boolean)
      .map(Number);
    setRange(newRange);
  }, [queryParameters.temperature]);

  const handleSwitch = (isEnabled: boolean): void => {
    setEnabled(isEnabled);
    if (!isEnabled) {
      setQueryParameters({
        ...queryParameters,
        temperature: '',
      });
    }
  };
  const handleSlider = ({ min, max }): void => {
    setQueryParameters({
      ...queryParameters,
      temperature: `${min},${max}`,
    });
  };
  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--400 mg-temperature-filter">
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
