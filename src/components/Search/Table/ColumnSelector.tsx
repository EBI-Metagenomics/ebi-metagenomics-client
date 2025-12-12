import React, { useState } from 'react';
import EMGModal from 'components/UI/EMGModal';

type ColumnSelectorProps = {
  pathname: string;
  columns: Record<string, Record<string, unknown>>;
  selectedColumns: Record<string, Record<string, boolean>>;
  setSelectedColumns: (state: Record<string, any>) => void;
};
const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  pathname,
  columns,
  selectedColumns,
  setSelectedColumns,
}) => {
  const [modalIsOpen, setIsOpen] = useState(false);

  const handleSelection = (event) => {
    const { value, checked } = event.target as HTMLInputElement;
    setSelectedColumns({
      ...selectedColumns,
      [pathname]: {
        ...selectedColumns[pathname],
        [value]: checked,
      },
    });
  };
  return (
    <>
      <EMGModal
        isOpen={modalIsOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Example Modal"
      >
        <h3>Available Columns</h3>
        <ul className="vf-list">
          {(
            columns[pathname].columns as Array<{ id: string; Header: string }>
          ).map(({ id, Header }) => (
            <li key={id}>
              <input
                type="checkbox"
                name={id}
                value={id}
                id={`mg-checkbox-${id}`}
                className="vf-form__checkbox"
                onChange={handleSelection}
                checked={selectedColumns[pathname][id]}
              />{' '}
              <label className="vf-form__label" htmlFor={`mg-checkbox-${id}`}>
                <span className="mg-filter-checkbox-label">{Header}</span>
              </label>
            </li>
          ))}
        </ul>
      </EMGModal>

      <button
        type="button"
        className="vf-button vf-button--sm vf-button--secondary"
        style={{ whiteSpace: 'nowrap', marginBottom: '8px' }}
        onClick={() => setIsOpen(true)}
      >
        <span className="icon icon-common icon-columns" />
      </button>
    </>
  );
};

export default ColumnSelector;
