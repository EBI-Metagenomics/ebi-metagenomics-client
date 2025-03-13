import React, { useState } from 'react';

import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useAnalysisDetail from 'hooks/data/useAnalysisDetail/Index';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import ChimericProportions from 'components/Asv/ChimericProportions';
import AsvDistribution from 'components/Asv/AsvDistribution';
// import JSZip from 'jszip';

const Asv: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const { hash } = window.location;
    return hash === '#asv-distribution' ? 'asv-distribution' : 'qc-statistics';
  });
  const accession = useURLAccession();
  const { data, loading, error } = useAnalysisDetail(accession);
  const dada2StatsFile = data?.downloads.find(
    (file) => file.download_group === 'asv.stats' && file.file_type === 'tsv'
  );
  const asvDistributionFile = data?.downloads.find(
    (file) =>
      file.download_group === 'asv.distribution' && file.file_type === 'tsv'
  );

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  const tabs = [
    { id: 'qc-statistics', label: 'Quality Control Statistics' },
    { id: 'asv-distribution', label: 'ASV Distribution' },
    { id: 'primer-identification', label: 'Primer Identification' },
  ];

  const handleTabClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tabId: string
  ) => {
    event.preventDefault();
    setActiveTab(tabId);
    window.history.pushState(null, '', `#${tabId}`);
  };

  // BELOW are WIP functions being used to trial the extraction of gff data fot the contig browser
  // const countFeatureTypes = (records) => {
  //   const counts = {};
  //   records.forEach((record) => {
  //     const { type } = record;
  //     counts[type] = (counts[type] || 0) + 1;
  //   });
  //   return counts;
  // };
  //
  // const parseGffContent = (content) => {
  //   const records = [];
  //
  //   // Split content by lines
  //   const lines = content.split('\n');
  //
  //   // Process each line
  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const line of lines) {
  //     // Skip empty lines and comment lines
  //     if (!line || line.trim() === '' || line.startsWith('#')) {
  //       // eslint-disable-next-line no-continue
  //       continue;
  //     }
  //
  //     // Split line by tabs
  //     const fields = line.split('\t');
  //     if (fields.length < 8) {
  //       // eslint-disable-next-line no-continue
  //       continue; // Skip malformed lines
  //     }
  //
  //     // Parse the attributes field (column 9)
  //     const attributesStr = fields[8] || '';
  //     const attributes = {};
  //
  //     attributesStr.split(';').forEach((attr) => {
  //       const [key, value] = attr.split('=');
  //       if (key && value) {
  //         attributes[key.trim()] = value.trim();
  //       }
  //     });
  //
  //     // Create a structured record
  //     records.push({
  //       seqid: fields[0],
  //       source: fields[1],
  //       type: fields[2],
  //       start: parseInt(fields[3], 10),
  //       end: parseInt(fields[4], 10),
  //       score: fields[5] === '.' ? null : parseFloat(fields[5]),
  //       strand: fields[6],
  //       phase: fields[7],
  //       attributes,
  //     });
  //   }
  //
  //   return records;
  // };
  //
  // const extractGffData = async () => {
  //   const filePath =
  //     // 'https://www.ebi.ac.uk/metagenomics/api/v1/analyses/MGYA00532217/file/ERZ1039804_FASTA_annotations.gff.bgz';
  //     '/ci/emg_api_datafiles/results/ERZ1039804_FASTA_annotations.gff.bgz';
  //
  //   try {
  //     // Fetch the compressed file
  //     const response = await fetch(filePath);
  //     if (!response.ok) {
  //       throw new Error(
  //         `Failed to fetch file: ${response.status} ${response.statusText}`
  //       );
  //     }
  //
  //     // Get the file as ArrayBuffer
  //     const compressedData = await response.arrayBuffer();
  //
  //     // Create a new JSZip instance
  //     const zip = new JSZip();
  //
  //     // Load the compressed data
  //     const zipContent = await zip.loadAsync(compressedData);
  //
  //     // Find the first file in the archive (assuming there's only one)
  //     const files = Object.keys(zipContent.files);
  //     if (files.length === 0) {
  //       throw new Error('No files found in the compressed archive');
  //     }
  //
  //     // Extract the GFF file content as text
  //     const gffFile = zipContent.files[files[0]];
  //     const gffContent = await gffFile.async('text');
  //
  //     // Parse the GFF content
  //     const gffRecords = parseGffContent(gffContent);
  //
  //     // Print the data in a clear format
  //     console.log('=== GFF Data Extraction Results ===');
  //     console.log(`Total records found: ${gffRecords.length}`);
  //
  //     // Print the first 5 records as a sample
  //     console.log('\nSample Records (first 5):');
  //     gffRecords.slice(0, 5).forEach((record, index) => {
  //       console.log(`\nRecord #${index + 1}:`);
  //       console.log(`  Sequence ID: ${record.seqid}`);
  //       console.log(`  Source: ${record.source}`);
  //       console.log(`  Type: ${record.type}`);
  //       console.log(`  Start: ${record.start}`);
  //       console.log(`  End: ${record.end}`);
  //       console.log(`  Score: ${record.score}`);
  //       console.log(`  Strand: ${record.strand}`);
  //       console.log(`  Phase: ${record.phase}`);
  //       console.log(`  Attributes: `, record.attributes);
  //     });
  //
  //     // Group by feature type and show counts
  //     const typeCounts = countFeatureTypes(gffRecords);
  //     console.log('\nFeature Type Distribution:');
  //     Object.entries(typeCounts)
  //       .sort((a, b) => b[1] - a[1])
  //       .forEach(([type, count]) => {
  //         console.log(`  ${type}: ${count}`);
  //       });
  //
  //     return gffRecords;
  //     // eslint-disable-next-line @typescript-eslint/no-shadow
  //   } catch (error) {
  //     console.error('Error extracting GFF data:', error);
  //     return null;
  //   }
  // };

  return (
    <section className="vf-content">
      {/* <button onClick={(e) => extractGffData()}>GFF EXTRACTOR</button> */}
      <div id="asv-tabs" className="vf-tabs">
        <ul className="vf-tabs__list" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} className="vf-tabs__item" role="presentation">
              <a
                className={`vf-tabs__link ${
                  activeTab === tab.id ? 'is-active' : ''
                }`}
                href={`#${tab.id}`}
                onClick={(e) => handleTabClick(e, tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={tab.id}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="vf-tabs-content">
        <section
          className="vf-tabs__section"
          id="qc-statistics"
          role="tabpanel"
          aria-labelledby="qc-statistics"
          style={{
            display: activeTab === 'qc-statistics' ? 'block' : 'none',
          }}
        >
          <DetailedVisualisationCard ftpLink={dada2StatsFile.url}>
            <div className="vf-card__content | vf-stack vf-stack--400">
              <h3 className="vf-card__heading">Amplicon Sequencing Results </h3>
              {/* <p className="vf-card__subheading">With sub–heading</p> */}
              <p className="vf-card__text">
                {/* <ChimericProportions fileUrl="http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/amplicon/asv/SRR1111111_dada2_stats.tsv" /> */}
                <ChimericProportions fileUrl={dada2StatsFile.url} />
              </p>
            </div>
          </DetailedVisualisationCard>
        </section>
        <section
          className="vf-tabs__section"
          id="asv-distribution"
          role="tabpanel"
          aria-labelledby="asv-distribution"
          style={{
            display: activeTab === 'asv-distribution' ? 'block' : 'none',
          }}
        >
          <DetailedVisualisationCard ftpLink={asvDistributionFile.url}>
            <div className="vf-card__content | vf-stack vf-stack--400">
              <h3 className="vf-card__heading">ASV Distribution </h3>
              <p className="vf-card__subheading">With sub–heading</p>
              <p className="vf-card__text">
                <AsvDistribution fileUrl={asvDistributionFile.url} />
              </p>
            </div>
          </DetailedVisualisationCard>
        </section>

        <section
          className="vf-tabs__section"
          id="primer-identification"
          role="tabpanel"
          aria-labelledby="primer-identification"
          style={{
            display: activeTab === 'primer-identification' ? 'block' : 'none',
          }}
        >
          <a
            href="https://www.ebi.ac.uk/training/services/mgnify/live-events"
            className="vf-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Primer Identification{' '}
            <i className="icon icon-common icon-external-link-alt" />
          </a>
        </section>
      </div>
    </section>
  );
};

export default Asv;
