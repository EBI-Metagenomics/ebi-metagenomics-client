import React, { useState, useEffect, useMemo, createContext } from 'react';

import axios from 'utils/protectedAxios';
import { MGnifyResponseObj, ErrorTypes } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Box from 'components/UI/Box';
import KeyValueList from 'components/UI/KeyValueList';
import ExtLink from 'components/UI/ExtLink';
import { Link } from 'react-router-dom';
import AssociatedAnalyses from 'components/Analysis/Analyses';
import { ENA_VIEW_URL } from 'utils/urls';
import ExtraAnnotations from 'components/ExtraAnnotations';
import Tabs from 'components/UI/Tabs';
import RouteForHash from 'components/Nav/RouteForHash';
import config from 'utils/config';

// Create a context to share assembly data with child components
const V2AssemblyContext = createContext<any>(null);

// DerivedGenomes component to display derived genomes
const DerivedGenomes: React.FC = () => {
  const { assemblyData } = React.useContext(V2AssemblyContext);
  const [data, setData] = useState(null);
  const accession = useURLAccession();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // const response = await axios.get(`assemblies/${accession}`);
        console.log('ACCESSIOn ', accession);
        // const response = await axios.get(`${config.api_v2}/${accession}`);
        const response = await axios.get(
          `http://localhost:8000/assemblies/ERZ26869131`
        );
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError({
          error: err,
          type: ErrorTypes.FetchError,
        });
        setLoading(false);
      }
    };

    if (accession) {
      fetchData();
    }
  }, [accession]);
  return (
    <Box label="Derived genomes">
      {data?.accession ? (
        <table className="vf-table | vf-table--compact | derived-genomes-table">
          <thead>
            <tr>
              <th>Genome accession</th>
              <th>ENA</th>
              <th>Species Representative</th>
              <th>Taxonomy</th>
              <th>Catalogue</th>
            </tr>
          </thead>
          <tbody>
            {/*{assemblyData.genome_links.map((link) => (*/}
            {/*  <tr key={link.genome.accession}>*/}
            {/*    <td>*/}
            {/*      <Link to={`/genomes/${link.genome.accession}`}>*/}
            {/*        {link.genome.accession}*/}
            {/*      </Link>*/}
            {/*    </td>*/}
            {/*    <td>✅</td> /!* Placeholder for ENA info *!/*/}
            {/*    <td>*/}
            {/*      {link.species_rep ? (*/}
            {/*        <Link to={`/genomes/${link.species_rep}`}>*/}
            {/*          {link.species_rep}*/}
            {/*        </Link>*/}
            {/*      ) : (*/}
            {/*        '—'*/}
            {/*      )}*/}
            {/*    </td>*/}
            {/*    <td>—</td> /!* Taxonomy not in API response *!/*/}
            {/*    <td>Marine v1.0</td> /!* Hardcoded for now *!/*/}
            {/*  </tr>*/}
            {/*))}*/}
          </tbody>
        </table>
      ) : (
        <p>No derived genomes found.</p>
      )}
    </Box>
  );
};

// Overview component to display assembly details
const Overview: React.FC = () => {
  const { assemblyData } = React.useContext(V2AssemblyContext);

  const details = [
    {
      key: 'Sample',
      value: assemblyData?.relationships?.samples?.data?.length
        ? () => (
            <>
              {assemblyData.relationships.samples.data.map((sample) => (
                <Link to={`/samples/${sample.id}`} key={sample.id as string}>
                  {sample.id}{' '}
                </Link>
              ))}
            </>
          )
        : null,
    },
    {
      key: 'Runs',
      value: assemblyData?.relationships?.runs?.data?.length
        ? () => (
            <>
              {assemblyData.relationships.runs.data.map((run) => (
                <Link to={`/runs/${run.id}`} key={run.id as string}>
                  {run.id}{' '}
                </Link>
              ))}
            </>
          )
        : null,
    },
    {
      key: 'ENA accession',
      value: () => (
        <ExtLink href={`${ENA_VIEW_URL}${assemblyData?.id}`}>
          {assemblyData?.id}
        </ExtLink>
      ),
    },
    // {
    //   key: 'Legacy accession',
    //   value: assemblyData.attributes['legacy-accession'] as string,
    // },
  ].filter(({ value }) => Boolean(value));

  return (
    <>
      <Box label="Description">
        <KeyValueList list={details} />
      </Box>
      <DerivedGenomes />
    </>
  );
};

// Analyses component to display associated analyses
const Analyses: React.FC = () => {
  return (
    <Box label="Associated analyses">
      <AssociatedAnalyses rootEndpoint="assemblies" />
    </Box>
  );
};

// AdditionalAnalyses component to display additional analyses
const AdditionalAnalyses: React.FC = () => {
  return (
    <Box label="Additional analyses">
      <p>
        Additional annotations produced by workflows run outside the scope of
        MGnify&apos;s versioned pipelines.
      </p>
      <ExtraAnnotations namespace="assemblies" />
    </Box>
  );
};

// Main component
const V2AssemblyPage: React.FC = () => {
  const accession = useURLAccession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const assemblyData = (data as MGnifyResponseObj | null)?.data;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // const response = await axios.get(`assemblies/${accession}`);
        console.log('ACCESSIOn ', accession);
        // const response = await axios.get(`${config.api_v2}/${accession}`);
        const response = await axios.get(
          `http://localhost:8000/assemblies/ERZ26869131`
        );
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError({
          error: err,
          type: ErrorTypes.FetchError,
        });
        setLoading(false);
      }
    };

    if (accession) {
      fetchData();
    }
  }, [accession]);

  // Ensure hook order is consistent across renders: compute memoized value unconditionally
  // const assemblyData = (data as MGnifyResponseObj | null)?.data;
  const value = useMemo(() => ({ assemblyData }), [assemblyData]);

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const tabs = [
    { label: 'Overview', to: '#overview' },
    { label: 'Analyses', to: '#analyses' },
    { label: 'Additional Analyses', to: '#additional-analyses' },
  ];

  return (
    <section className="vf-content">
      {/*<h2>Assembly: {assemblyData?.accession || ''}</h2>*/}
      <h2>Assembly: {data?.accession || ''}</h2>
      <Tabs tabs={tabs} />
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <V2AssemblyContext.Provider value={value}>
            <RouteForHash hash="#overview" isDefault>
              <Overview />
            </RouteForHash>
            <RouteForHash hash="#analyses">
              <Analyses />
            </RouteForHash>
            <RouteForHash hash="#additional-analyses">
              <AdditionalAnalyses />
            </RouteForHash>
          </V2AssemblyContext.Provider>
        </div>
      </section>
    </section>
  );
};

export default V2AssemblyPage;
