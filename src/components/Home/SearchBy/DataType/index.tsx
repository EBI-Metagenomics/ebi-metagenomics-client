import React from 'react';
import { Link } from 'react-router-dom';
import { useEBISearchData } from 'hooks/useMGnifyData';
import './style.css';

const DataAnalysesTypeRow: React.FC<{
  type: string;
  label: string;
  link: string;
}> = ({ type, label, link }) => {
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
        <Link to={link} className="mg-link">
          {data?.hitCount || '...'}
        </Link>
      </td>
      <td className="vf-table__cell">{label}</td>
    </tr>
  );
};
const DataTypeRow: React.FC<{ label: string; endpoint: string; link: string }> =
  ({ label, endpoint, link }) => {
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
          <Link to={link} className="mg-link">
            {data?.hitCount || '??'}
          </Link>
        </td>
        <td className="vf-table__cell">{label}</td>
      </tr>
    );
  };

const DataType: React.FC = () => {
  const analysesTypes = [
    { type: 'amplicon', label: 'amplicon', link: '' },
    { type: 'assembly', label: 'assemblies', link: '' },
    { type: 'metabarcoding', label: 'metabarcoding', link: '' },
    { type: 'metagenomic', label: 'metagenomes', link: '' },
    { type: 'metatranscriptomic', label: 'metatranscriptomics', link: '' },
  ];
  const types = [
    {
      label: 'studies',
      endpoint: 'metagenomics_projects',
      link: '/search#projects',
    },
    {
      label: 'samples',
      endpoint: 'metagenomics_samples',
      link: '/search#samples',
    },
    {
      label: 'analyses',
      endpoint: 'metagenomics_analyses',
      link: '/search#analyses',
    },
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
          {analysesTypes.map(({ type, label, link }) => (
            <DataAnalysesTypeRow
              type={type}
              label={label}
              link={link}
              key={type}
            />
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
          {types.map(({ endpoint, label, link }) => (
            <DataTypeRow
              endpoint={endpoint}
              label={label}
              link={link}
              key={endpoint}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataType;
