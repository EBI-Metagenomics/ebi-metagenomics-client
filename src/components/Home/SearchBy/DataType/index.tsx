import React from 'react';
import { Link } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import useEBISearchData from 'hooks/data/useEBISearchData';
import FetchError from 'components/UI/FetchError';
import './style.css';

const DataAnalysesTypeRow: React.FC<{
  type: string;
  label: string;
  link: string;
}> = ({ type, label, link }) => {
  const { data, loading, error } = useEBISearchData('metagenomics_analyses', {
    query: 'domain_source:metagenomics_analyses',
    size: 0,
    fields: 'id,name,description,biome_name,metagenomics_samples',
    facetcount: 0,
    facetsdepth: 5,
    facets: `experiment_type:${type}`,
  });
  if (loading)
    return (
      <tr>
        <td>
          <Loading size="small" />
        </td>
      </tr>
    );
  if (error) return <FetchError error={error} />;
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
const DataTypeRow: React.FC<{
  label: string;
  endpoint: string;
  link: string;
}> = ({ label, endpoint, link }) => {
  const { data, loading, error } = useEBISearchData(endpoint, {
    query: `domain_source:${endpoint}`,
    size: 0,
    fields: 'id,name,description,biome_name,metagenomics_samples',
    facetcount: 0,
    facetsdepth: 5,
  });
  if (error) return <FetchError error={error} />;
  return (
    <tr className="vf-table__row">
      <td className="vf-table__cell" style={{ textAlign: 'right' }}>
        {loading ? (
          <Loading size="small" />
        ) : (
          <Link to={link} className="mg-link">
            {data?.hitCount || '??'}
          </Link>
        )}
      </td>
      <td className="vf-table__cell">{label}</td>
    </tr>
  );
};

const DataType: React.FC = () => {
  const analysesTypes = [
    {
      type: 'amplicon',
      label: 'amplicon',
      link: '/search/analyses?experiment_type=amplicon',
    },
    {
      type: 'assembly',
      label: 'assemblies',
      link: '/search/analyses?experiment_type=assembly',
    },
    {
      type: 'metabarcoding',
      label: 'metabarcoding',
      link: '/search/analyses?experiment_type=metabarcoding',
    },
    {
      type: 'metagenomic',
      label: 'metagenomes',
      link: '/search/analyses?experiment_type=metagenomic',
    },
    {
      type: 'metatranscriptomic',
      label: 'metatranscriptomics',
      link: '/search/analyses?experiment_type=metatranscriptomic',
    },
    {
      type: 'long_reads_assembly',
      label: 'Long Reads Assemblies',
      link: '/search/analyses?experiment_type=long_reads_assembly',
    },
  ];
  const types = [
    {
      label: 'studies',
      endpoint: 'metagenomics_projects',
      link: '/search/studies',
    },
    {
      label: 'samples',
      endpoint: 'metagenomics_samples',
      link: '/search/samples',
    },
    {
      label: 'analyses',
      endpoint: 'metagenomics_analyses',
      link: '/search/analyses',
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