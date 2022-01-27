import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import TabsForQueryParameter from 'components/UI/TabsForQueryParameter';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import UserContext from 'pages/Login/UserContext';
import PhylumCharts from './PhylumCharts';

import './style.css';

const tabs = [
  { label: 'Krona', to: 'krona' },
  { label: 'Pie', to: 'pie' },
  { label: 'Column', to: 'column' },
  { label: 'Stacked Column', to: 'stacked-column' },
];

const PARAMETER_NAME = 'type';
const PARAMETER_DEFAULT = 'krona';
type TaxonomicAnalysesProps = {
  accession: string;
};
const Taxonomy: React.FC<TaxonomicAnalysesProps> = ({ accession }) => {
  const { data, loading, error } = useMGnifyData(
    `analyses/${accession}/taxonomy/overview`
  );
  const [queryParameters] = useQueryParametersState({
    [PARAMETER_NAME]: PARAMETER_DEFAULT,
  });
  const datum = data?.data as Record<string, unknown>;

  const enableSSU = datum?.taxonomy_ssu_count > 0 || datum?.taxonomy_count > 0;
  const enableLSU = datum?.taxonomy_lsu_count > 0;
  const enableITSoneDB = datum?.taxonomy_itsonedb_count > 0;
  const enableITSUnite = datum?.taxonomy_itsunite_count > 0;

  const { config } = useContext(UserContext);
  const [taxResults, setTaxResults] = useState('/unite');
  useEffect(() => {
    if (!loading && !error && data) {
      setTaxResults(
        (enableITSoneDB && '/itsonedb') ||
          (enableITSUnite && '/unite') ||
          (enableSSU && '/ssu') ||
          (enableLSU && '/lsu')
      );
    }
  }, [
    data,
    loading,
    error,
    enableITSUnite,
    enableITSoneDB,
    enableLSU,
    enableSSU,
  ]);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;

  const handleTaxChange = (event): void => {
    setTaxResults(event.target.value);
  };

  return (
    <div className="vf-stack">
      <div>
        {(enableSSU || enableLSU) && (
          <fieldset
            className="vf-form__fieldset vf-stack vf-stack--400 mg-fieldbox"
            style={{
              width: '15rem',
            }}
          >
            <legend className="vf-form__legend">rRNA</legend>
            <label>
              <input
                type="radio"
                id="smallrRNA"
                name="tax-results"
                value="/ssu"
                checked={taxResults === '/ssu'}
                onChange={handleTaxChange}
              />{' '}
              small subunit rRNA
            </label>
            <label>
              <input
                type="radio"
                id="largerRNA"
                name="tax-results"
                value="/lsu"
                checked={taxResults === '/lsu'}
                onChange={handleTaxChange}
              />{' '}
              large subunit rRNA
            </label>
          </fieldset>
        )}
        {(enableITSoneDB || enableITSUnite) && (
          <fieldset
            className="vf-form__fieldset vf-stack vf-stack--400 mg-fieldbox"
            style={{
              width: '15rem',
            }}
          >
            <legend className="vf-form__legend">ITS</legend>
            <label>
              <input
                type="radio"
                id="smallrRNA"
                name="tax-results"
                value="/itsonedb"
                checked={taxResults === '/itsonedb'}
                onChange={handleTaxChange}
              />{' '}
              ITS with ITSoneDB
            </label>
            <label>
              <input
                type="radio"
                id="largerRNA"
                name="tax-results"
                value="/unite"
                checked={taxResults === '/unite'}
                onChange={handleTaxChange}
              />{' '}
              ITS1/2 with UNITE
            </label>
          </fieldset>
        )}
      </div>
      <div>
        These are the results from the taxonomic analysis steps of our pipeline.
        You can switch between different views of the data using the menu of
        icons below (pie, bar, stacked and interactive krona charts). The data
        used to build these charts can be found under the{' '}
        <Link to="#download">Download</Link> tab.
      </div>
      <TabsForQueryParameter
        tabs={tabs}
        queryParameter={PARAMETER_NAME}
        defaultValue={PARAMETER_DEFAULT}
      />
      <div className="vf-tabs-content">
        {queryParameters[PARAMETER_NAME] === 'krona' ? (
          <object
            className="krona_chart"
            data={`${config.api}analyses/${accession}/krona${taxResults}?collapse=false`}
            type="text/html"
            title="Interactive Krona chart"
          />
        ) : (
          <PhylumCharts
            accession={accession}
            category={taxResults}
            chartType={String(queryParameters[PARAMETER_NAME])}
          />
        )}
      </div>
    </div>
  );
};

export default Taxonomy;
