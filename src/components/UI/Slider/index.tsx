import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce, round } from 'lodash-es';
import './style.css';

import 'styles/filters.css';

type SelectionType = {
  min: number;
  max: number;
};

type SliderProps = {
  min: number;
  max: number;
  steps?: number;
  precision?: number;
  logarithmic?: boolean;
  selection?: SelectionType;
  isEnabled?: boolean;
  onChange?: (selection: SelectionType) => void;
};

const areEqual = (s1: SelectionType, s2: SelectionType): boolean =>
  s1.max === s2.max && s1.min === s2.min;

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  steps = 100,
  precision = 0,
  logarithmic = false,
  isEnabled = true,
  selection = null,
  onChange = (s) => s,
}) => {
  const [currentSelection, setCurrentSelection] = useState({
    min: selection && 'min' in selection ? selection.min : min,
    max: selection && 'max' in selection ? selection.max : max,
  });
  // eslint-disable-next-line react-@/hooks/exhaustive-deps
  const debounced = useCallback(debounce(onChange, 300), []);
  useEffect(() => {
    if (!areEqual(currentSelection, selection)) {
      debounced(currentSelection);
    }
    // eslint-disable-next-line react-@/hooks/exhaustive-deps
  }, [currentSelection]);
  useEffect(() => {
    if (!areEqual(currentSelection, selection)) {
      setCurrentSelection(selection);
    }
    // eslint-disable-next-line react-@/hooks/exhaustive-deps
  }, [selection]);

  const step = useMemo(() => {
    if (logarithmic) {
      return (Math.log10(max) - Math.log10(min)) / steps;
    }
    return (max - min) / steps;
  }, [steps, min, max, logarithmic]);

  const scaleMin = useMemo(() => {
    return logarithmic ? Math.log10(min) : min;
  }, [logarithmic, min]);

  const scaleMax = useMemo(() => {
    return logarithmic ? Math.log10(max) : max;
  }, [logarithmic, max]);

  return (
    <div className="mg-multirange-wrapper">
      <input
        type="range"
        min={scaleMin}
        max={scaleMax}
        step={step}
        name="min"
        value={
          logarithmic ? Math.log10(currentSelection.min) : currentSelection.min
        }
        className="original"
        disabled={!isEnabled}
        onChange={(evt) => {
          const scaleLoc = Number(evt.target.value);
          const newVal = logarithmic ? 10 ** scaleLoc : scaleLoc;
          setCurrentSelection({
            ...currentSelection,
            min: round(newVal, precision),
          });
        }}
      />
      <input
        type="range"
        min={scaleMin}
        max={scaleMax}
        step={step}
        name="max"
        value={
          logarithmic ? Math.log10(currentSelection.max) : currentSelection.max
        }
        className="ghost"
        disabled={!isEnabled}
        onChange={(evt) => {
          const scaleLoc = Number(evt.target.value);
          const newVal = logarithmic ? 10 ** scaleLoc : scaleLoc;
          setCurrentSelection({
            ...currentSelection,
            max: round(newVal, precision),
          });
        }}
      />
      <div className="labels">
        <div className="label-min">
          <span>{currentSelection.min}</span>
        </div>
        <div className="label-max">
          <span>{currentSelection.max}</span>
        </div>
      </div>
    </div>
  );
};

export default Slider;
