import React, { memo, useEffect, useState } from 'react';

import Slider from 'components/UI/Slider';
import Switch from 'components/UI/Switch';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';

const MIN = 500;
const MAX = 10e6;

const ContigLengthFilter: React.FC = () => {
  const [contigLength, setContigLength] = useQueryParamState(
    'contig_length',
    ''
  );
  const [enabled, setEnabled] = useState(!!contigLength);

  const [range, setRange] = useState(
    contigLength.split(',').filter(Boolean).map(Number)
  );
  useEffect(() => {
    const newRange = contigLength.split(',').filter(Boolean).map(Number);
    setRange(newRange);
  }, [contigLength]);

  const handleSwitch = (isEnabled: boolean): void => {
    setEnabled(isEnabled);
    if (!isEnabled) {
      setContigLength('');
    }
  };
  const handleSlider = ({ min, max }): void => {
    setRange([min, max]);
    setContigLength(`${min},${max}`);
  };
  return (
    <fieldset className="vf-form__fieldset vf-stack vf-stack--200 mg-contig-length-filter">
      <legend className="vf-form__legend mg-contig-filter">
        Contig length (bp)
      </legend>
      <div className="mg-switch-and-slider">
        <Switch
          id="contig_length_filter"
          onChange={handleSwitch}
          isOn={enabled}
        />
        <Slider
          min={MIN}
          max={MAX}
          steps={100}
          isEnabled={enabled}
          selection={{
            min: range?.[0] || MIN,
            max: range?.[1] || MAX,
          }}
          onChange={handleSlider}
          logarithmic
        />
      </div>
    </fieldset>
  );
};
export default memo(ContigLengthFilter);
