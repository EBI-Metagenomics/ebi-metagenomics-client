import React from 'react';

export type KeyValueItemsList = {
  key: string;
  value: string | React.ElementType;
}[];

type KeyValueProps = {
  list: KeyValueItemsList;
  dataCy?: string;
  renderIfEmpty?: boolean;
};

const hasRenderableValue = (value: React.ReactNode) =>
  value !== null && value !== undefined && value !== '';

const KeyValueList: React.FC<KeyValueProps> = ({
  list,
  dataCy,
  renderIfEmpty = false,
}) => (
  <div
    className="vf-grid vf-grid__col-2"
    style={{
      gridTemplateColumns: '1fr 2fr',
      rowGap: '0.5rem',
    }}
    data-cy={dataCy}
  >
    {list.map(({ key, value: Value }) => (
      <React.Fragment key={key}>
        {(renderIfEmpty || hasRenderableValue(Value)) && (
          <React.Fragment>
            <div style={{ textAlign: 'right' }} data-cy="kvl-key">
              {key}:
            </div>
            <div data-cy="kvl-value">
              {typeof Value === 'string' ? Value : Value && <Value />}
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    ))}
  </div>
);

export default KeyValueList;
