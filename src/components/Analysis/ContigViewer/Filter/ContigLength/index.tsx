import React, { useEffect, useState, useContext, memo } from 'react';

import Slider from 'components/UI/Slider';
import Switch from 'components/UI/Switch';
import ContigsQueryContext from 'components/Analysis/ContigViewer/ContigsQueryContext';

const MIN = 500;
const MAX = 100000;

const ContigLengthFilter: React.FC = () => {
  const { queryParameters, setQueryParameters } =
    useContext(ContigsQueryContext);
  const [enabled, setEnabled] = useState(!!queryParameters.contig_length);

  const [range, setRange] = useState(
    (queryParameters.contig_length as string)
      .split(',')
      .filter(Boolean)
      .map(Number)
  );
  useEffect(() => {
    const newRange = (queryParameters.contig_length as string)
      .split(',')
      .filter(Boolean)
      .map(Number);
    setRange(newRange);
  }, [queryParameters.contig_length]);

  const handleSwitch = (isEnabled: boolean): void => {
    setEnabled(isEnabled);
    if (!isEnabled) {
      setQueryParameters({
        ...queryParameters,
        contig_length: '',
      });
    }
  };
  const handleSlider = ({ min, max }): void => {
    setQueryParameters({
      ...queryParameters,
      contig_length: `${min},${max}`,
    });
  };
  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--200 mg-contig-length-filter">
      <legend className="vf-form__legend">Contig length (bp)</legend>
      <div className="mg-switch-and-slider">
        <Switch
          id="contig_length_filter"
          onChange={handleSwitch}
          isOn={enabled}
        />
        <Slider
          min={MIN}
          max={MAX}
          step={100}
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
export default memo(ContigLengthFilter);
