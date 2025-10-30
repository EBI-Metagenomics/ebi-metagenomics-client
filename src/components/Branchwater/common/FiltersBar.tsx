import React from 'react';
import { BranchwaterFilters } from './useBranchwaterResults';

export type FiltersBarProps = {
  filters: BranchwaterFilters;
  onFilterChange: (field: keyof BranchwaterFilters, value: string) => void;
};

const inputStyle: React.CSSProperties = {
  width: '100%',
};

const groupStyle: React.CSSProperties = {
  minWidth: 180,
};

const FiltersBar: React.FC<FiltersBarProps> = ({ filters, onFilterChange }) => {
  const entries: Array<{ key: keyof BranchwaterFilters; label: string; placeholder?: string }>= [
    { key: 'acc', label: 'Accession', placeholder: 'e.g. ERR...' },
    { key: 'assay_type', label: 'Assay Type', placeholder: 'e.g. WGS' },
    { key: 'bioproject', label: 'Bioproject' },
    { key: 'collection_date_sam', label: 'Collection Date' },
    { key: 'containment', label: 'Containment' },
    { key: 'geo_loc_name_country_calc', label: 'Location' },
    { key: 'organism', label: 'Metagenome' },
  ];
  return (
    <div className="vf-stack vf-stack--200">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {entries.map(({ key, label, placeholder }) => (
          <div key={String(key)} className="vf-form__item" style={groupStyle}>
            <label className="vf-form__label" htmlFor={`bw-filter-${String(key)}`}>
              {label}
            </label>
            <input
              id={`bw-filter-${String(key)}`}
              className="vf-form__input"
              style={inputStyle}
              type="text"
              value={filters[key] || ''}
              placeholder={placeholder}
              onChange={(e) => onFilterChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FiltersBar;
