import React, { useState } from 'react';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import Tabs from 'components/UI/Tabs';
import Overview from 'components/Sample/Overview';
import RouteForHash from 'components/Nav/RouteForHash';
import KeyValueList from 'components/UI/KeyValueList';
import AnnotationMetadata from 'components/Sample/AnnotationMetadata';
import axios from 'axios';
import marineRegionsEezData from 'public/data/marine-regions-eez-data.json';
import DisplayAbsInfo, {
  defaultEezMetadata,
  EezMetadata,
  Sov,
  SovereignsArray,
  EezInfo,
} from 'utils/eezAbs';
import Breadcrumbs from 'components/Nav/Breadcrumbs';
import useSampleDetail from 'hooks/data/useSampleDetail';
import { flatMap, size, startCase } from 'lodash-es';
import InfoBanner from 'components/UI/InfoBanner';
import AssociatedStudies from 'components/Study/Studies';

const tabs = [
  { label: 'Sample metadata', to: '#' },
  { label: 'Associated studies', to: '#studies' },
  { label: 'Analysed associated runs', to: '#runs' },
  { label: 'Analysed associated assemblies', to: '#assemblies' },
];

const SamplePage: React.FC = () => {
  const accession = useURLAccession();
  const {
    data: sampleData,
    loading,
    error,
  } = useSampleDetail(accession as string);
  const [eezData, setEezData] = useState<EezMetadata>({
    ...defaultEezMetadata,
  });
  const [fetchEezDataCalled, setFetchEezDataCalled] = React.useState(false);
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!sampleData) return <Loading />;

  const fetchSovereignsAbsInfo = (mrgId: number): SovereignsArray => {
    const matchingEez = marineRegionsEezData.find((eez) => eez.MRGID === mrgId);

    const sovereigns: SovereignsArray = [];
    if (!matchingEez) return sovereigns;

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
      !sampleData.biome?.lineage.includes(
        'root:Environmental:Aquatic'
      )
    ) {
      eezMetadata.eezInfoText =
        'The sample is from a biome for which MGnify does not currently report ABS requirements.';
      eezMetadata.eezBadgeColor = 'tertiary';
      setEezData(eezMetadata);
      return;
    }
    if (!sampleData?.metadata?.lat || !sampleData?.metadata?.lon) {
      eezMetadata.eezInfoText =
        'This sample does not have coordinates, so no information concerning EEZ and ABS requirements can be provided at this point.';
      eezMetadata.eezBadgeColor = 'tertiary';
      setEezData(eezMetadata);
      return;
    }
    axios
      .get(
        `https://marineregions.org/rest/getGazetteerRecordsByLatLong.json/${sampleData.metadata?.lat}/${sampleData.metadata?.lon}/?typeID=70&offset=0`
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
        sampleData.mrgid = response.data[0].MRGID;
      })
      .catch((err) => {
        if (err.response.status === 404) {
          eezMetadata.eezInfoPrefix =
            'Based on the sample coordinates, this sample originates from';
          eezMetadata.beyondEez = true;
          eezMetadata.eezBadgeColor = 'tertiary';
          setEezData(eezMetadata);
        }
      });
  };

  if (!fetchEezDataCalled) {
    fetchEezData();
    if (eezData.eezInfoText || eezData.beyondEez) {
      setFetchEezDataCalled(true);
    }
  }
  const breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Samples', url: '/browse/samples' },
    { label: accession as string },
  ];
  return (
    <section className="vf-content">
      <Breadcrumbs links={breadcrumbs} />
      <h2>Sample overview ({accession})</h2>
      <h3>{sampleData?.sample_title}</h3>
      <section className="vf-grid">
        <div className="vf-stack vf-stack--200">
          <Overview data={sampleData} />
          <Tabs tabs={tabs} />
          <section className="vf-grid">
            <div className="vf-stack vf-stack--200">
              <RouteForHash hash="" isDefault>
                <KeyValueList
                  dataCy="sample-metadata"
                  list={flatMap(sampleData.metadata, (value, key) => ({
                    key: startCase(key),
                    value: String(value),
                  }))}
                />
                {!size(sampleData.metadata) && (
                  <InfoBanner
                    type={'info'}
                    title={'No metadata to be displayed.'}
                  />
                )}
                {/*<ClearingHouseMetadata sampleAccession={accession as string} />*/}
                {/*TODO CDCH*/}
                <AnnotationMetadata sample={sampleData} />
              </RouteForHash>
              <RouteForHash hash="#studies">
                {sampleData.studies && (
                  <AssociatedStudies associatedStudies={sampleData.studies} />
                )}
              </RouteForHash>
              {/*    <RouteForHash hash="#runs">*/}
              {/*TODO*/}
              {/*      <AssociatedRuns />*/}
              {/*    </RouteForHash>*/}
              {/*    <RouteForHash hash="#assemblies">*/}
              {/*TODO*/}
              {/*      <AssociatedAssemblies rootEndpoint="samples" />*/}
              {/*    </RouteForHash>*/}
            </div>
          </section>
        </div>
      </section>

      {(eezData.eezInfoText || eezData.beyondEez) && (
        <div className="vf-box vf-box-theme--primary vf-box--easy">
          <h6 className="vf-box__heading">EEZ Metadata</h6>
          <div className="vf-box__text">
            <aside className="vf-article-meta-information">
              <EezInfo eezData={eezData} />
              {eezData.qualifiesForAbsCheck && (
                <DisplayAbsInfo eezData={eezData} />
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
          </div>
        </div>
      )}
    </section>
  );
};

export default SamplePage;
