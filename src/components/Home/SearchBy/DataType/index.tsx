import React from 'react';
import { useEBISearchData } from 'hooks/useMGnifyData';
import './style.css';

const DataAnalysesTypeRow: React.FC<{ type: string; label: string }> = ({
  type,
  label,
}) => {
  const data = useEBISearchData('metagenomics_analyses', {
    query: 'domain_source:metagenomics_analyses',
    size: 0,
    fields: 'id,name,description,biome_name,metagenomics_samples',
    facetcount: 0,
    facetsdepth: 5,
    facets: `experiment_type:${type}`,
  });

  if (!data) return null;
  return (
    <tr className="vf-table__row">
      <td className="vf-table__cell" style={{ textAlign: 'right' }}>
        {data?.hitCount || '??'}
      </td>
      <td className="vf-table__cell">{label}</td>
    </tr>
  );
};
const DataTypeRow: React.FC<{ label: string; endpoint: string }> = ({
  label,
  endpoint,
}) => {
  const data = useEBISearchData(endpoint, {
    query: `domain_source:${endpoint}`,
    size: 0,
    fields: 'id,name,description,biome_name,metagenomics_samples',
    facetcount: 0,
    facetsdepth: 5,
  });

  if (!data) return null;
  return (
    <tr className="vf-table__row">
      <td className="vf-table__cell" style={{ textAlign: 'right' }}>
        {data?.hitCount || '??'}
      </td>
      <td className="vf-table__cell">{label}</td>
    </tr>
  );
};

const DataType: React.FC = () => {
  const analysesTypes = [
    { type: 'amplicon', label: 'amplicon' },
    { type: 'assembly', label: 'assemblies' },
    { type: 'metabarcoding', label: 'metabarcoding' },
    { type: 'metagenomic', label: 'metagenomes' },
    { type: 'metatranscriptomic', label: 'metatranscriptomics' },
  ];
  const types = [
    { label: 'studies', endpoint: 'metagenomics_projects' },
    { label: 'samples', endpoint: 'metagenomics_samples' },
    { label: 'analyses', endpoint: 'metagenomics_analyses' },
  ];

  return (
    <div className="vf-grid vf-grid__col-4" style={{ fontSize: '0.7rem' }}>
      <div style={{ textAlign: 'right' }}>
        <span
          className="icon icon-conceptual icon-c3"
          style={{ fontSize: '2rem' }}
          data-icon="d"
        />
      </div>
      <table className="vf-table mg-small-table">
        <tbody className="vf-table__body">
          {analysesTypes.map(({ type, label }) => (
            <DataAnalysesTypeRow type={type} label={label} key={type} />
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'right' }}>
        <span
          className="icon icon-functional icon-c9"
          style={{ fontSize: '2rem' }}
          data-icon="U"
        />
      </div>
      <table className="vf-table mg-small-table">
        <tbody className="vf-table__body">
          {types.map(({ endpoint, label }) => (
            <DataTypeRow endpoint={endpoint} label={label} key={endpoint} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataType;
