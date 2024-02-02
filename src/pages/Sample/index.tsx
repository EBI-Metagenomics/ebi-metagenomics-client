import React, { useState } from 'react';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { MGnifyResponseObj } from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import Overview from 'components/Sample/Overview';
import AssociatedStudies from 'components/Study/Studies';
import AssociatedRuns from 'components/Sample/Runs';
import AssociatedAssemblies from 'components/Assembly/Assemblies';
import RouteForHash from 'components/Nav/RouteForHash';
import KeyValueList from 'components/UI/KeyValueList';
import AnnotationMetadata from 'components/Sample/AnnotationMetadata';
import ClearingHouseMetadata from 'components/Sample/ClearingHouseMetadata';
import axios from 'axios';
import marineRegionsEezData from 'public/data/marine-regions-eez-data.json';
import {
  displayAbsInfo,
  EezMetadata,
  defaultEezMetadata,
  SovereignsArray,
  Sov,
} from 'utils/eezAbs';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import HTMLRenderer from 'components/UI/HTMLRederer';

const tabs = [
  { label: 'Sample metadata', to: '#' },
  { label: 'Associated studies', to: '#studies' },
  { label: 'Analysed associated runs', to: '#runs' },
  { label: 'Analysed associated assemblies', to: '#assemblies' },
];

const SamplePage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`samples/${accession}`);
  const [eezData, setEezData] = useState<EezMetadata>({
    ...defaultEezMetadata,
  });
  const [fetchEezDataCalled, setFetchEezDataCalled] = React.useState(false);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: sampleData } = data as MGnifyResponseObj;

  const fetchSovereignsAbsInfo = (mrgId: number) => {
    const matchingEez = marineRegionsEezData.find((eez) => eez.MRGID === mrgId);

    const sovereigns: SovereignsArray = [];

    // const sovereigns: SovereignsArray = [
    //   {
    //     name: 'Brazil',
    //     absStatus: 1,
    //   },
    //   {
    //     name: 'France',
    //     absStatus: 1,
    //   },
    //   {
    //     name: 'United Kingdom',
    //     absStatus: 3,
    //   },
    // ];

    const maxPossibleNumberOfSovereigns = 3;
    for (let i = 1; i <= maxPossibleNumberOfSovereigns; i++) {
      if (!matchingEez[`SOVEREIGN${i}`]) break;
      const sovereign: Sov = {
        name: matchingEez[`SOVEREIGN${i}`],
        absStatus: matchingEez[`SOVEREIGN${i}_ABS_STATUS`],
      };
      sovereigns.push(sovereign);
    }
    return sovereigns;
  };

  const fetchEezData = () => {
    const eezMetadata: EezMetadata = {
      ...defaultEezMetadata,
      eezInfoPrefix:
        'Based on the sample coordinates, this sample originates from the',
    };
    if (
      !sampleData?.relationships?.biome?.data?.id.includes(
        'root:Environmental:Aquatic'
      )
    ) {
      eezMetadata.eezInfoText =
        'The sample is from a biome for which MGnify does not currently report ABS requirements.';
      eezMetadata.eezBadgeColor = 'tertiary';
      setEezData(eezMetadata);
      return;
    }
    if (!sampleData.attributes.latitude || !sampleData.attributes.longitude) {
      eezMetadata.eezInfoText =
        'This sample does not have coordinates, so no information concerning EEZ and ABS requirements can be provided at this point.';
      eezMetadata.eezBadgeColor = 'tertiary';
      setEezData(eezMetadata);
      return;
    }
    axios
      .get(
        `https://marineregions.org/rest/getGazetteerRecordsByLatLong.json/${sampleData.attributes.latitude}/${sampleData.attributes.longitude}/?typeID=70&offset=0`
      )
      .then((response) => {
        eezMetadata.eezInfoText = `${eezMetadata.eezInfoPrefix} ${response.data[0].preferredGazetteerName}`;
        eezMetadata.eezName = response.data[0].preferredGazetteerName;
        eezMetadata.eezBadgeColor = 'primary';
        eezMetadata.sovereigns = fetchSovereignsAbsInfo(response.data[0].MRGID);
        eezMetadata.hasMultipleSovereigns =
          eezMetadata.sovereigns.filter((sovereign) => sovereign.name).length >
          1;
        eezMetadata.qualifiesForAbsCheck = eezMetadata.sovereigns.length > 0;
        setEezData(eezMetadata);
        sampleData.attributes.mrgid = response.data[0].MRGID;
      })
      .catch((err) => {
        if (err.response.status === 404) {
          eezMetadata.eezInfoPrefix =
            'Based on the sample coordinates, this sample originates from ';
          eezMetadata.eezInfoText = `${eezMetadata.eezInfoPrefix} a region beyond an EEZ. While this means there are no national ABS obligations under individual countries' jurisdiction, benefit-sharing obligations may still apply for the use of Marine Genetic Resource (MGR) in areas beyond national jurisdictions, as outlined in the <a href="https://www.un.org/bbnj/"> BBNJ agreement. </a> Although this agreement is not yet in force, its provisions, including obligations for MGR users, will apply retroactively once enacted.`;
          eezMetadata.eezBadgeColor = 'tertiary';
          setEezData(eezMetadata);
        }
      });
  };

  if (!fetchEezDataCalled) {
    fetchEezData();
    if (eezData.eezInfoText) {
      setFetchEezDataCalled(true);
    }
  }
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Samples', url: '/browse/samples' },
    { label: accession },
  ];
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Sample overview ({accession})</h2>
      <h3>Sample {sampleData.attributes['sample-name']}</h3>
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <Overview data={sampleData} />
          <Tabs tabs={tabs} />
          <section className="vf-grid">
            <div className="vf-stack vf-stack--200">
              <RouteForHash hash="" isDefault>
                <KeyValueList
                  dataCy="sample-metadata"
                  list={
                    (sampleData?.attributes?.['sample-metadata'] as {
                      key: string;
                      value: string;
                    }[]) || []
                  }
                />
                {!(sampleData?.attributes?.['sample-metadata'] as [])
                  .length && (
                  <div className="vf-box">
                    <h3 className="vf-box__heading">
                      <span className="icon icon-common icon-info" /> No
                      metadata to be displayed.
                    </h3>
                  </div>
                )}
                <ClearingHouseMetadata sampleAccession={accession} />
                <AnnotationMetadata sampleAccession={accession} />
              </RouteForHash>
              <RouteForHash hash="#studies">
                <AssociatedStudies rootEndpoint="samples" />
              </RouteForHash>
              <RouteForHash hash="#runs">
                <AssociatedRuns />
              </RouteForHash>
              <RouteForHash hash="#assemblies">
                <AssociatedAssemblies rootEndpoint="samples" />
              </RouteForHash>
            </div>
          </section>
        </div>
      </section>

      {eezData.eezInfoText && (
        <div className="vf-box vf-box-theme--primary vf-box--easy">
          <h6 className="vf-box__heading">EEZ Metadata</h6>
          <p className="vf-box__text">
            <aside className="vf-article-meta-information">
              {eezData.eezInfoText && (
                <div className="vf-meta__details">
                  <p>
                    <span
                      className={`vf-badge vf-badge--${eezData.eezBadgeColor}`}
                    >
                      <abbr
                        title="Exclusive Economic Zone"
                        className="eez-abbr"
                      >
                        EEZ Info
                      </abbr>
                    </span>
                    &nbsp;
                    <HTMLRenderer htmlContent={eezData.eezInfoText} />
                  </p>
                </div>
              )}
              {eezData.qualifiesForAbsCheck && (
                <HTMLRenderer htmlContent={displayAbsInfo(eezData)} />
              )}
              <details className="vf-details">
                <summary className="vf-details--summary">More info</summary>
                The current system for determining the EEZ is based on
                information retrieved from{' '}
                <a href="https://marineregions.org/gazetteer.php?p=webservices&type=rest#/getGazetteerRecordsByLatLong">
                  The Marine Regions getGazetteerRecordsByLatLong
                </a>{' '}
                APIs. The list of EEZ countries with an ABS and Digital Sequence
                Information (DSI) obligations was obtained from ABSint on
                November 2023. This information is only supposed to be guidance
                and you are advised to independently verify your ABS
                obligations.
                <br /> <br />
                Exclusive Economic Zone (EEZ): The United Nations Convention on
                the Law of the Sea (UNCLOS) defines an Exclusive Economic Zone
                (EEZ) as generally extending 200 nautical miles from shore,
                within which the coastal state has the right to explore and
                exploit, and the responsibility to conserve and manage, both
                living and non-living resources. The EEZ is linked to
                jurisdiction. The Ocean Biodiversity Information System (OBIS)
                provides further clarification on the EEZ borders as well as
                coastal, marine, and terrestrial waters.
              </details>
            </aside>
          </p>
        </div>
      )}
    </section>
  );
};

export default SamplePage;
