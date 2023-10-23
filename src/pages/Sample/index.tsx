import React from 'react';

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
import cheerio from 'cheerio';

const tabs = [
  { label: 'Sample metadata', to: '#' },
  { label: 'Associated studies', to: '#studies' },
  { label: 'Analysed associated runs', to: '#runs' },
  { label: 'Analysed associated assemblies', to: '#assemblies' },
];

const SamplePage: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useMGnifyData(`samples/${accession}`);
  const [eezData, setEezData] = React.useState({
    eezInfoText: '',
    eezBadgeColor: '',
    abdInfoText: '',
    absBadgeColor: '',
  });
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  const { data: sampleData } = data as MGnifyResponseObj;

  // const fetchAbsCountries = async () => {
  //   try {
  //     const response = await axios.get(
  //       'https://treaties.un.org/Pages/ViewDetails.aspx?src=TREATY&mtdsg_no=XXVII-8-b&chapter=27&clang=_en'
  //     );
  //     const $ = cheerio.load(response.data);
  //     const table = $(
  //       '#ctl00_ctl00_ContentPlaceHolder1_ContentPlaceHolderInnerPage_tblgrid'
  //     );
  //     const countries: string[] = [];
  //     table.find('tr').each((index, row) => {
  //       const countryCell = $(row).find('td').first();
  //       if (countryCell.text().trim() !== '') {
  //         const countryName = countryCell.text().trim();
  //         countries.push(countryName);
  //       }
  //     });
  //     countries.forEach((country, index) => {});
  //   } catch (err) {
  //     console.error('Failed to retrieve the web page:', err);
  //   }
  // };

  const determineIfEezHasAbsObligations = (eezName) => {
    // TODO determine from API
    // fetchAbsCountries();
    return eezName.includes('Brazil');
  };
  const fetchEezData = () => {
    const eezMetadata = {
      eezInfoPrefix:
        'Based on the sample coordinates, this sample originates from the',
      eezInfoText: '',
      eezName: '',
      hasAbsObligations: false,
      abdInfoText: '',
      eezBadgeColor: '',
      absBadgeColor: '',
    };
    if (!sampleData.attributes.latitude || !sampleData.attributes.longitude) {
      eezMetadata.eezInfoText =
        'This sample does not have coordinates, so no information concerning ABS requirements can be provided at this point.';
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
        const eezHasAbsObligations = determineIfEezHasAbsObligations(
          response.data[0].preferredGazetteerName
        );
        eezMetadata.hasAbsObligations = eezHasAbsObligations;
        eezMetadata.abdInfoText = eezHasAbsObligations
          ? 'This EEZ has ABS obligations '
          : 'This EEZ does not have ABS obligations';
        eezMetadata.absBadgeColor = eezHasAbsObligations
          ? 'secondary'
          : 'tertiary';
        setEezData(eezMetadata);
        sampleData.attributes.mrgid = response.data[0].MRGID;
      })
      .catch((err) => {
        if (err.response.status === 404) {
          eezMetadata.eezInfoText = `${eezMetadata.eezInfoPrefix} a region outside of an EEZ. Therefore, there are no ABS obligations`;
          setEezData(eezMetadata);
        }
      });
  };
  if (!eezData.eezInfoText) {
    fetchEezData();
  }
  return (
    <section className="vf-content">
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
              <div className="vf-meta__details">
                <p>
                  <span
                    className={`vf-badge vf-badge--${eezData.eezBadgeColor}`}
                  >
                    <abbr title="Exclusive Economic Zone" className="eez-abbr">
                      EEZ Info
                    </abbr>
                  </span>
                  {/* <br /> */}
                  &nbsp; {eezData.eezInfoText}
                </p>
              </div>
              <div className="vf-meta__details">
                <p>
                  <span
                    className={`vf-badge vf-badge--${eezData.absBadgeColor}`}
                  >
                    <abbr
                      title="Access and Benefit Sharing"
                      className="eez-abbr"
                    >
                      ABS Info
                    </abbr>
                  </span>
                  &nbsp; {eezData.abdInfoText}
                </p>
              </div>
              <details className="vf-details">
                <summary className="vf-details--summary">More info</summary>
                The current system for determining the EEZ is based on the shape
                map obtained from X on Y(date). The list of EEZ countries with
                an ABS and Digital Sequence Information (DSI) obligations was
                obtained from ABSint on N(date).This information is only
                supposed to be guidance and you are advised to independently
                verify your ABS obligations.
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
