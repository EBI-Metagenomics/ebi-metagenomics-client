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
  controlled = false,
}) => {
  let value = isOn;
  let setValue = noop;
  if (!controlled) {
    // A bit strange to have conditional hooks, but the idea is that controlled is a never-changing flag.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    [value, setValue] = useState(isOn);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setValue(isOn);
      onChange(isOn);
    }, [isOn, onChange, setValue]);
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
