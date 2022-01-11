import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Loading from 'components/UI/Loading';
import useEBISearchData from 'hooks/data/useEBISearchData';
import FetchError from 'components/UI/FetchError';
import './style.css';
import useMGnifyData from 'hooks/data/useMGnifyData';

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
      <td className="vf-table__cell">
        <Link to={link} className="mg-link">
          {label}
        </Link>
      </td>
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
      <td className="vf-table__cell">
        <Link to={link} className="mg-link">
          {label}
        </Link>
      </td>
    </tr>
  );
};

const EMGAPIDataTypeRow: React.FC<{
  aggregator: (data: unknown) => number;
  labelRenderer: string | ((data: unknown) => string);
  endpoint: string;
  link: string;
}> = ({ endpoint, link, aggregator, labelRenderer }) => {
  const { data, loading, error } = useMGnifyData(endpoint);

  const num = useMemo(() => {
    return aggregator(data);
  }, [data, aggregator]);

  const label = useMemo(() => {
    if (typeof labelRenderer === 'string') {
      return labelRenderer;
    }
    return labelRenderer(data);
  }, [data, labelRenderer]);

  if (error) return <FetchError error={error} />;
  return (
    <tr className="vf-table__row">
      <td className="vf-table__cell" style={{ textAlign: 'right' }}>
        {loading ? (
          <Loading size="small" />
        ) : (
          <Link to={link} className="mg-link">
            {num}
          </Link>
        )}
      </td>
      <td className="vf-table__cell">
        <Link to={link} className="mg-link">
          {label}
        </Link>
      </td>
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
  const emgApiTypes = [
    {
      endpoint: 'genome-catalogues',
      link: '/browse#genomes',
      aggregator: (cataloguesData) =>
        cataloguesData?.data
          ?.map((cat) => cat.attributes['genome-count'])
          ?.reduce((x, y) => x + y),
      labelRenderer: (cataloguesData) =>
        cataloguesData?.data
          ? `genomes in ${cataloguesData?.data?.length} MAG catalogues`
          : 'genomes',
    },
  ];

  return (
    <div className="vf-grid vf-grid__col-2" style={{ fontSize: '0.7rem' }}>
      <div>
        <h5>
          <span className="icon icon-conceptual icon-c3" data-icon="d" />
          &nbsp; Analysis types
        </h5>
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
      </div>
      <div>
        <h5>
          <span className="icon icon-functional icon-c9" data-icon="U" />
          &nbsp; Public data
        </h5>
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
            {emgApiTypes.map(
              ({ endpoint, labelRenderer, link, aggregator }) => (
                <EMGAPIDataTypeRow
                  endpoint={endpoint}
                  labelRenderer={labelRenderer}
                  link={link}
                  aggregator={aggregator}
                  key={endpoint}
                />
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataType;
