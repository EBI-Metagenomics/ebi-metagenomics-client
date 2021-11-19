import React from 'react';

type KeyValueProps = {
  list: { key: string; value: string }[];
};

const KeyValueList: React.FC<KeyValueProps> = ({ list }) => (
  <div
    className="vf-grid vf-grid__col-2"
    style={{
      gridTemplateColumns: '1fr 2fr',
      rowGap: '0.5rem',
    }}
  >
    {list.map(({ key, value }) => (
      <React.Fragment key={key}>
        <div style={{ textAlign: 'right' }}>{key}:</div>
        <div>{value}</div>
      </React.Fragment>
    ))}
  </div>
);

export default KeyValueList;
