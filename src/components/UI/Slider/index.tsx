import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash-es';
import './style.css';

type SelectionType = {
  min: number;
  max: number;
};

type SliderProps = {
  min: number;
  max: number;
  selection?: SelectionType;
  isEnabled?: boolean;
  onChange?: (selection: SelectionType) => void;
};

const areEqual = (s1: SelectionType, s2: SelectionType): boolean =>
  s1.max === s2.max && s1.min === s2.min;

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  isEnabled = true,
  selection = null,
  onChange = (s) => s,
}) => {
  const [currentSelection, setCurrentSelection] = useState({
    min: selection && 'min' in selection ? selection.min : min,
    max: selection && 'max' in selection ? selection.max : max,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounced = useCallback(debounce(onChange, 300), []);
  useEffect(() => {
    if (!areEqual(currentSelection, selection)) {
      debounced(currentSelection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSelection]);
  useEffect(() => {
    if (!areEqual(currentSelection, selection)) {
      setCurrentSelection(selection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  return (
    <div className="mg-multirange-wrapper">
      <input
        type="range"
        min={min}
        max={max}
        name="min"
        value={currentSelection.min}
        className="original"
        disabled={!isEnabled}
        onChange={(evt) => {
          setCurrentSelection({
            min: Number(evt.target.value),
            max: currentSelection.max,
          });
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        name="max"
        value={currentSelection.max}
        className="ghost"
        disabled={!isEnabled}
        onChange={(evt) => {
          setCurrentSelection({
            max: Number(evt.target.value),
            min: currentSelection.min,
          });
        }}
      />
      <div className="labels">
        <div className="label-min">
          <span>{Math.min(currentSelection.min, currentSelection.max)}</span>
        </div>
        <div className="label-max">
          <span>{Math.max(currentSelection.min, currentSelection.max)}</span>
        </div>
      </div>
    </div>
  );
};

export default Slider;
