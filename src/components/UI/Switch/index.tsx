import React, { useState, useEffect } from 'react';
import './style.css';
import { noop } from 'lodash-es';

type SwitchProps = {
  id: string;
  isOn?: boolean;
  onChange?: (v: boolean) => void;
  extraClass?: string;
  controlled?: boolean;
};
const Switch: React.FC<SwitchProps> = ({
  id,
  onChange = (v) => v,
  isOn = false,
  extraClass,
  controlled = false
}) => {

  let value = isOn;
  let setValue = noop;
  if (!controlled) {
    [value, setValue] = useState(isOn);
    useEffect(() => {
      setValue(isOn);
      onChange(isOn);
    }, [isOn, onChange]);
  }

  return (
    <div>
      <input
        className={`mg-switch ${extraClass}`}
        type="checkbox"
        id={id}
        checked={value}
        onChange={() => {
          onChange(!value);
          setValue(!value);
        }}
      />
    </div>
  );
};

export default Switch;
