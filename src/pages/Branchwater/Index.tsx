import React, { useRef, useState } from 'react';
import render from 'components/UI/SamplesMap/render';
import SamplesMap from 'components/UI/SamplesMap';
import { Wrapper } from '@googlemaps/react-wrapper';
import config from 'utils/config';

const sampleEntries = [
  {
    acc: 'ERR4172301',
    assay_type: 'OTHER',
    bioproject: 'PRJEB38431',
    biosample_link: 'https://www.ncbi.nlm.nih.gov',
    cANI: 0.9,
    collection_date: '2018-09-03',
    containment: 0.11,
    geo_loc_name_country: 'China',
    lat_lon: 'NP',
    organism: 'environmental sample',
  },
  {
    acc: 'ERR4172302',
    assay_type: 'RNA-Seq',
    bioproject: 'PRJEB38432',
    biosample_link: 'https://www.ncbi.nlm.nih.gov/sra/ERR4172302',
    cANI: 0.8,
    collection_date: '2019-05-12',
    containment: 0.15,
    geo_loc_name_country: 'USA',
    lat_lon: '37.7749N, 122.4194W',
    organism: 'Homo sapiens',
  },
  {
    acc: 'ERR4172303',
    assay_type: 'WGS',
    bioproject: 'PRJEB38433',
    biosample_link: 'https://www.ncbi.nlm.nih.gov/sra/ERR4172303',
    cANI: 0.85,
    collection_date: '2020-11-25',
    containment: 0.2,
    geo_loc_name_country: 'Germany',
    lat_lon: '52.5200N, 13.4050E',
    organism: 'Bacillus subtilis',
  },
  {
    acc: 'ERR4172304',
    assay_type: 'ChIP-Seq',
    bioproject: 'PRJEB38434',
    biosample_link: 'https://www.ncbi.nlm.nih.gov/sra/ERR4172304',
    cANI: 0.95,
    collection_date: '2021-07-14',
    containment: 0.25,
    geo_loc_name_country: 'Brazil',
    lat_lon: '14.2350S, 51.9253W',
    organism: 'Escherichia coli',
  },
  {
    acc: 'ERR4172305',
    assay_type: 'Metagenomics',
    bioproject: 'PRJEB38435',
    biosample_link: 'https://www.ncbi.nlm.nih.gov/sra/ERR4172305',
    cANI: 0.75,
    collection_date: '2017-03-08',
    containment: 0.1,
    geo_loc_name_country: 'Australia',
    lat_lon: '25.2744S, 133.7751E',
    organism: 'environmental sample',
  },
];

const Branchwater = () => {
  const ref = useRef();
  const [showMgnifySourmash, setShowMgnifySourmash] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [targetDatabase, setTargetDatabase] = useState('MAGs');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setShowMgnifySourmash(true);
    // if (file && file.name.endsWith('.fasta')) {
    //   setUploadedFile(file);
    // } else {
    //   alert('Please upload a valid FASTA file.');
    // }
  };

  const handleSearchClick = (event) => {
    event.preventDefault();
    setShowMgnifySourmash(true);
    // if (uploadedFile) {
    //   setShowMgnifySourmash(true);
    // } else {
    //   alert('Please upload a FASTA file first.');
    // }
    console.log(`Searching in ${targetDatabase} database`);
  };

  const handleClearClick = () => {
    setShowMgnifySourmash(false);
    setUploadedFile(null);
    const fileInput = document.getElementById(
      'file-upload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div>
      <div>
        <form className="vf-stack vf-stack--400">
          <div className="vf-form__item vf-stack">
            <input id="file-upload" type="file" onChange={handleFileUpload} />

            <fieldset className="vf-form__fieldset vf-stack vf-stack--400">
              <legend className="vf-form__legend">
                Select target database
              </legend>

              <div className="vf-form__item vf-form__item--radio">
                <input
                  type="radio"
                  name="targetDatabase"
                  value="MAGs"
                  id="1"
                  className="vf-form__radio"
                  checked={targetDatabase === 'MAGs'}
                  onChange={() => setTargetDatabase('MAGs')}
                />
                <label htmlFor="1" className="vf-form__label">
                  MAGs
                </label>
              </div>

              <div className="vf-form__item vf-form__item--radio">
                <input
                  type="radio"
                  name="targetDatabase"
                  value="Metagenomes"
                  id="2"
                  className="vf-form__radio"
                  checked={targetDatabase === 'Metagenomes'}
                  onChange={() => setTargetDatabase('Metagenomes')}
                />
                <label htmlFor="2" className="vf-form__label">
                  Metagenomes
                </label>
              </div>

              <button
                className="vf-button vf-button--sm vf-button--primary mg-button"
                onClick={handleSearchClick}
              >
                Search
              </button>
              <button
                id="clear-button-mag"
                type="button"
                className="vf-button vf-button--sm vf-button--tertiary"
                onClick={handleClearClick}
              >
                Clear
              </button>
            </fieldset>
          </div>
        </form>
      </div>

      {showMgnifySourmash && (
        <>
          <svg
            className="vf-icon-sprite vf-icon-sprite--tables"
            style={{ display: 'none' }}
          >
            <defs>
              <g id="vf-table-sortable--up">
                <path
                  xmlns="http://www.w3.org/2000/svg"
                  d="M17.485,5.062,12.707.284a1.031,1.031,0,0,0-1.415,0L6.515,5.062a1,1,0,0,0,.707,1.707H10.25a.25.25,0,0,1,.25.25V22.492a1.5,1.5,0,1,0,3,0V7.019a.249.249,0,0,1,.25-.25h3.028a1,1,0,0,0,.707-1.707Z"
                />
              </g>
              <g id="vf-table-sortable--down">
                <path
                  xmlns="http://www.w3.org/2000/svg"
                  d="M17.7,17.838a1,1,0,0,0-.924-.617H13.75a.249.249,0,0,1-.25-.25V1.5a1.5,1.5,0,0,0-3,0V16.971a.25.25,0,0,1-.25.25H7.222a1,1,0,0,0-.707,1.707l4.777,4.778a1,1,0,0,0,1.415,0l4.778-4.778A1,1,0,0,0,17.7,17.838Z"
                />
              </g>
              <g id="vf-table-sortable">
                <path
                  xmlns="http://www.w3.org/2000/svg"
                  d="M9,19a1,1,0,0,0-.707,1.707l3,3a1,1,0,0,0,1.414,0l3-3A1,1,0,0,0,15,19H13.5a.25.25,0,0,1-.25-.25V5.249A.25.25,0,0,1,13.5,5H15a1,1,0,0,0,.707-1.707l-3-3a1,1,0,0,0-1.414,0l-3,3A1,1,0,0,0,9,5h1.5a.25.25,0,0,1,.25.25v13.5a.25.25,0,0,1-.25.25Z"
                />
              </g>
            </defs>
          </svg>
          <table className="vf-table">
            <tbody className="vf-table__body">
              {sampleEntries.map((entry, index) => (
                <tr className="vf-table__row" key={index}>
                  <td className="vf-table__cell">{entry.acc}</td>
                  <td className="vf-table__cell">{entry.assay_type}</td>
                  <td className="vf-table__cell">{entry.bioproject}</td>
                  <td className="vf-table__cell">
                    <a
                      href={entry.biosample_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Link
                    </a>
                  </td>
                  <td className="vf-table__cell">{entry.cANI}</td>
                  <td className="vf-table__cell">{entry.collection_date}</td>
                  <td className="vf-table__cell">{entry.containment}</td>
                  <td className="vf-table__cell">
                    {entry.geo_loc_name_country}
                  </td>
                  <td className="vf-table__cell">{entry.lat_lon}</td>
                  <td className="vf-table__cell">{entry.organism}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Wrapper apiKey={config.googleMapsKey} render={render}>
            <div ref={ref} id="map" style={{ height: '100%' }} />
          </Wrapper>
        </>
      )}
    </div>
  );
};

export default Branchwater;
