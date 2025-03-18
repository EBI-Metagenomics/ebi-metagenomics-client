import React, { useContext, useRef, useState } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import './style.css';
import SlimVisualisationCard from 'components/Analysis/VisualisationCards/SlimVisualisationCard';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';

type TaxonomicAnalysesProps = {
  accession: string;
};

const extractNavItems = (downloads, taxonomyKey) => {
  const navItems = [];
  downloads.filter((download) => {
    if (download.download_group.includes(taxonomyKey)) {
      const markerType = download.download_group.split('.').pop();
      if (!navItems.some((item) => item.label === markerType)) {
        navItems.push({
          label: markerType,
          id: `asv-${markerType.toLowerCase()}`,
          contents: [download],
        });
      } else {
        const index = navItems.findIndex((item) => item.label === markerType);
        navItems[index].contents.push(download);
      }
    }
    return false;
  });

  return navItems;
};

const Taxonomy: React.FC<TaxonomicAnalysesProps> = ({ accession }) => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);
  const [activeNavItem, setActiveNavItem] = useState('asv-ssu');
  const [activeCategory, setActiveCategory] = useState('taxonomy-asv');
  const [activeContent, setActiveContent] = useState(null);

  const asvNavItems = extractNavItems(
    analysisOverviewData.downloads,
    'taxonomies.asv'
  );

  const uniqueAsvNavItems = asvNavItems.filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );

  const uniqueClosedRefNavItems = extractNavItems(
    analysisOverviewData.downloads,
    'taxonomies.closed_reference'
  );

  const visualizationRef = useRef(null);
  const asvDetailsRef = useRef(null);
  const closedRefDetailsRef = useRef(null);

  const handleNavItemClick = (item, category, content) => {
    setActiveNavItem(item);
    setActiveCategory(category);
    setActiveContent(content);
  };

  const handleViewClick = (analysisType, markerType) => {
    let navItemId = '';
    let categoryId = '';

    // TODO: do away with nested if-else statements

    if (analysisType === 'asv') {
      categoryId = 'taxonomy-asv';
      navItemId = `asv-${markerType.toLowerCase()}`;

      if (asvDetailsRef.current) {
        asvDetailsRef.current.setAttribute('open', 'true');
      }

      if (closedRefDetailsRef.current) {
        closedRefDetailsRef.current.removeAttribute('open');
      }
    } else if (analysisType === 'closed_ref') {
      categoryId = 'taxonomy-closed-ref';
      navItemId = `closed-ref-${markerType.toLowerCase()}`;

      if (closedRefDetailsRef.current) {
        closedRefDetailsRef.current.setAttribute('open', 'true');
      }

      if (asvDetailsRef.current) {
        asvDetailsRef.current.removeAttribute('open');
      }
    }

    setActiveNavItem(navItemId);
    setActiveCategory(categoryId);

    if (visualizationRef.current) {
      visualizationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const renderVisualizationCard = (file, index) => {
    if (file.file_type === 'html') {
      return (
        <DetailedVisualisationCard
          key={`${file.alias}-${index}`}
          ftpLink={file.url}
          title={file.alias || 'Visualization'}
          subheading={`${file.description || 'Analysis details'}`}
        >
          {file.long_description && (
            <div className="taxonomy-visualization-content">
              <iframe
                title={`${file.alias} iframe`}
                className="multiqc-iframe"
                src={file.url}
              />
              <p>{file.long_description}</p>
            </div>
          )}
        </DetailedVisualisationCard>
      );
    }
    if (
      file.file_type === 'mseq' ||
      file.file_type === 'tsv' ||
      !file.file_type
    ) {
      return (
        <SlimVisualisationCard
          key={`${file.alias}-${index}`}
          fileData={file}
          onDownload={() => console.log('Download triggered', file.url)}
          onCopy={() => console.log('Copy triggered', file.url)}
        >
          {file.long_description && (
            <div className="taxonomy-visualization">
              <div className="taxonomy-visualization-content">
                <p>{file.long_description}</p>
              </div>
            </div>
          )}
        </SlimVisualisationCard>
      );
    }
  };

  const processClosedRefMarkerGenes = () => {
    if (!analysisOverviewData.metadata?.marker_gene_summary?.closed_reference) {
      return {
        SSU: {
          bacteria: { read_count: 0, majority_marker: false },
          archaea: { read_count: 0, majority_marker: false },
          eukarya: { read_count: 0, majority_marker: false },
          total_read_count: 0,
          has_majority: false,
          view_available: false,
        },
        LSU: {
          bacteria: { read_count: 0, majority_marker: false },
          archaea: { read_count: 0, majority_marker: false },
          eukarya: { read_count: 0, majority_marker: false },
          total_read_count: 0,
          has_majority: false,
          view_available: false,
        },
        ITS: {
          total_read_count: 0,
          has_majority: false,
          view_available: false,
          is_its: true,
        },
      };
    }

    const closedRef =
      analysisOverviewData.metadata.marker_gene_summary.closed_reference;

    const ssuData = closedRef.SSU || {};
    const ssuBacteria = ssuData.Bacteria || {
      read_count: 0,
      majority_marker: false,
    };
    const ssuArchaea = ssuData.Archaea || {
      read_count: 0,
      majority_marker: false,
    };
    const ssuEukarya = ssuData.Eukarya || {
      read_count: 0,
      majority_marker: false,
    };
    const ssuTotalReads =
      ssuBacteria.read_count + ssuArchaea.read_count + ssuEukarya.read_count;
    const ssuHasMajority =
      ssuBacteria.majority_marker ||
      ssuArchaea.majority_marker ||
      ssuEukarya.majority_marker;

    const lsuData = closedRef.LSU || {};
    const lsuBacteria = lsuData.Bacteria || {
      read_count: 0,
      majority_marker: false,
    };
    const lsuArchaea = lsuData.Archaea || {
      read_count: 0,
      majority_marker: false,
    };
    const lsuEukarya = lsuData.Eukarya || {
      read_count: 0,
      majority_marker: false,
    };
    const lsuTotalReads =
      lsuBacteria.read_count + lsuArchaea.read_count + lsuEukarya.read_count;
    const lsuHasMajority =
      lsuBacteria.majority_marker ||
      lsuArchaea.majority_marker ||
      lsuEukarya.majority_marker;

    const itsData = closedRef.ITS || {};
    const itsEukarya = itsData.Eukarya || {
      read_count: 0,
      majority_marker: false,
    };
    const itsTotalReads = itsEukarya.read_count;
    const itsHasMajority = itsEukarya.majority_marker;

    return {
      SSU: {
        bacteria: ssuBacteria,
        archaea: ssuArchaea,
        eukarya: ssuEukarya,
        total_read_count: ssuTotalReads,
        has_majority: ssuHasMajority,
        view_available: ssuTotalReads > 0,
      },
      LSU: {
        bacteria: lsuBacteria,
        archaea: lsuArchaea,
        eukarya: lsuEukarya,
        total_read_count: lsuTotalReads,
        has_majority: lsuHasMajority,
        view_available: lsuTotalReads > 0,
      },
      ITS: {
        total_read_count: itsTotalReads,
        has_majority: itsHasMajority,
        view_available: itsTotalReads > 0,
        is_its: true,
      },
    };
  };

  const processAsvMarkerGenes = () => {
    if (!analysisOverviewData.metadata?.marker_gene_summary?.asv) {
      return [];
    }

    type AsvMarkerData = {
      amplified_region: string;
      asv_count: number;
      read_count: number;
    };

    const asvData = analysisOverviewData.metadata.marker_gene_summary
      .asv as Record<string, AsvMarkerData>;
    const amplifiedRegions = [];

    Object.entries(asvData).forEach(([markerGene, data]) => {
      amplifiedRegions.push({
        marker_gene: markerGene,
        amplified_region: data.amplified_region,
        asv_count: data.asv_count,
        read_count: data.read_count,
      });
    });

    return amplifiedRegions;
  };

  const groupedClosedRefMarkerGenes = processClosedRefMarkerGenes();
  const asvAmplifiedRegions = processAsvMarkerGenes();

  const maxClosedRefReadCount = Math.max(
    groupedClosedRefMarkerGenes.SSU.total_read_count,
    groupedClosedRefMarkerGenes.LSU.total_read_count,
    groupedClosedRefMarkerGenes.ITS.total_read_count
  );

  const maxAsvReadCount = Math.max(
    ...asvAmplifiedRegions.map((region) => region.read_count)
  );

  return (
    <div>
      <details className="vf-details custom-vf-details" open>
        <summary className="vf-details--summary custom-vf-details--summary">
          Marker Gene Summary
        </summary>
        <p>
          The tables below show the marker genes that were identified and
          analysed.
        </p>
        <p>
          The pipeline searches for the different marker genes shown in these
          tables, which shows which ones were identified and analysed in this
          run. The tables also show which types of analysis results are
          available for each identified marker gene.
        </p>

        <svg className="vf-icon-sprite vf-icon-sprite--tables" display="none">
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

        <h3 className="marker-table-heading">ASV Marker Genes</h3>

        <table className="vf-table marker-gene-table">
          <thead className="vf-table__header">
            <tr className="vf-table__row">
              <th className="vf-table__heading" scope="col">
                Marker Gene
              </th>
              <th className="vf-table__heading" scope="col">
                Amplified Region
              </th>
              <th className="vf-table__heading" scope="col">
                ASV Count
              </th>
              <th className="vf-table__heading" scope="col">
                Read Count
              </th>
              <th className="vf-table__heading" scope="col">
                View
              </th>
            </tr>
          </thead>

          <tbody className="vf-table__body">
            {asvAmplifiedRegions.map((region, index) => (
              <tr
                key={`${region.marker_gene}-${region.amplified_region}`}
                className={`vf-table__row ${
                  region.read_count === maxAsvReadCount
                    ? 'majority-marker-row'
                    : ''
                }`}
              >
                <td className="vf-table__cell">
                  <div className="marker-name-container">
                    {region.marker_gene}
                    {region.read_count === maxAsvReadCount && (
                      <span
                        className="majority-marker-badge"
                        title="Majority Marker"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                </td>

                <td className="vf-table__cell">
                  {region.amplified_region || (
                    <span className="na-value">N/A</span>
                  )}
                </td>

                <td className="vf-table__cell">
                  <span className="read-count-value">
                    {region.asv_count.toLocaleString()}
                  </span>
                </td>

                <td className="vf-table__cell">
                  <div className="read-count-container">
                    <span className="read-count-value">
                      {region.read_count.toLocaleString()}
                    </span>

                    {region.read_count > 0 && (
                      <div className="read-count-bar-container">
                        <div
                          className="read-count-bar-background"
                          style={{
                            width: `${Math.min(
                              100,
                              (region.read_count / maxAsvReadCount) * 100
                            )}%`,
                          }}
                        >
                          <div
                            className={`stacked-bar-segment ${
                              region.marker_gene.includes('16S')
                                ? 'bacteria-bar'
                                : region.marker_gene.includes('18S')
                                ? 'eukarya-bar'
                                : 'its-bar'
                            }`}
                            style={{ width: '100%' }}
                            title={`${
                              region.marker_gene
                            }: ${region.read_count.toLocaleString()} reads`}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>

                <td className="vf-table__cell view-buttons-cell">
                  {region.read_count > 0 ? (
                    <button
                      type="button"
                      className="vf-search__button | vf-button vf-button--primary mg-text-search-button vf-button--sm"
                      onClick={() => handleViewClick('asv', region.marker_gene)}
                    >
                      <span
                        className="icon icon-common icon-check-circle"
                        style={{ color: '#dcfce7' }}
                      />
                      <span className="vf-button__text">View</span>
                    </button>
                  ) : (
                    <div className="not-available">
                      <span
                        className="icon icon-common icon-minus-circle"
                        style={{ color: 'grey' }}
                      />
                      <span className="vf-button__text">Not calculated</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="marker-table-heading">Closed Reference Marker Genes</h3>

        <table className="vf-table marker-gene-table">
          <thead className="vf-table__header">
            <tr className="vf-table__row">
              <th className="vf-table__heading" scope="col">
                Marker Type
              </th>
              <th className="vf-table__heading" scope="col">
                Bacteria
              </th>
              <th className="vf-table__heading" scope="col">
                Archaea
              </th>
              <th className="vf-table__heading" scope="col">
                Eukarya
              </th>
              <th className="vf-table__heading" scope="col">
                View
              </th>
              <th className="vf-table__heading" scope="col">
                Total Read Count
              </th>
            </tr>
          </thead>

          <tbody className="vf-table__body">
            <tr
              className={`vf-table__row ${
                groupedClosedRefMarkerGenes.SSU.has_majority
                  ? 'majority-marker-row'
                  : ''
              }`}
            >
              <td className="vf-table__cell">
                <div className="marker-name-container">
                  SSU
                  {groupedClosedRefMarkerGenes.SSU.has_majority && (
                    <span
                      className="majority-marker-badge"
                      title="Majority Marker"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </td>

              <td className="vf-table__cell">
                {groupedClosedRefMarkerGenes.SSU.bacteria.read_count > 0 ? (
                  <span className="read-count-value bacteria-count">
                    {groupedClosedRefMarkerGenes.SSU.bacteria.read_count.toLocaleString()}
                  </span>
                ) : (
                  <span className="na-value">N/A</span>
                )}
              </td>

              <td className="vf-table__cell">
                {groupedClosedRefMarkerGenes.SSU.archaea.read_count > 0 ? (
                  <span className="read-count-value archaea-count">
                    {groupedClosedRefMarkerGenes.SSU.archaea.read_count.toLocaleString()}
                  </span>
                ) : (
                  <span className="na-value">N/A</span>
                )}
              </td>

              <td className="vf-table__cell">
                {groupedClosedRefMarkerGenes.SSU.eukarya.read_count > 0 ? (
                  <span className="read-count-value eukarya-count">
                    {groupedClosedRefMarkerGenes.SSU.eukarya.read_count.toLocaleString()}
                  </span>
                ) : (
                  <span className="na-value">N/A</span>
                )}
              </td>

              <td className="vf-table__cell view-buttons-cell">
                {groupedClosedRefMarkerGenes.SSU.view_available &&
                groupedClosedRefMarkerGenes.SSU.total_read_count > 0 ? (
                  <button
                    type="button"
                    className="vf-search__button | vf-button vf-button--primary mg-text-search-button vf-button--sm"
                    onClick={() => handleViewClick('closed_ref', 'SSU')}
                  >
                    <span
                      className="icon icon-common icon-check-circle"
                      style={{ color: '#dcfce7' }}
                    />
                    <span className="vf-button__text">View</span>
                  </button>
                ) : (
                  <div className="not-available">
                    <span
                      className="icon icon-common icon-minus-circle"
                      style={{ color: 'grey' }}
                    />
                    <span className="vf-button__text">Not calculated</span>
                  </div>
                )}
              </td>

              <td className="vf-table__cell">
                <div className="read-count-container">
                  <span className="read-count-value">
                    {groupedClosedRefMarkerGenes.SSU.total_read_count.toLocaleString()}
                  </span>

                  {groupedClosedRefMarkerGenes.SSU.total_read_count > 0 && (
                    <div className="read-count-bar-container">
                      <div
                        className="read-count-bar-background"
                        style={{
                          width: `${Math.min(
                            100,
                            (groupedClosedRefMarkerGenes.SSU.total_read_count /
                              maxClosedRefReadCount) *
                              100
                          )}%`,
                        }}
                      >
                        <div className="stacked-bar-container">
                          {groupedClosedRefMarkerGenes.SSU.bacteria.read_count >
                            0 && (
                            <div
                              className="stacked-bar-segment bacteria-bar"
                              style={{
                                width: `${
                                  (groupedClosedRefMarkerGenes.SSU.bacteria
                                    .read_count /
                                    groupedClosedRefMarkerGenes.SSU
                                      .total_read_count) *
                                  100
                                }%`,
                              }}
                              title={`Bacteria: ${groupedClosedRefMarkerGenes.SSU.bacteria.read_count.toLocaleString()} reads`}
                            ></div>
                          )}
                          {groupedClosedRefMarkerGenes.SSU.archaea.read_count >
                            0 && (
                            <div
                              className="stacked-bar-segment archaea-bar"
                              style={{
                                width: `${
                                  (groupedClosedRefMarkerGenes.SSU.archaea
                                    .read_count /
                                    groupedClosedRefMarkerGenes.SSU
                                      .total_read_count) *
                                  100
                                }%`,
                              }}
                              title={`Archaea: ${groupedClosedRefMarkerGenes.SSU.archaea.read_count.toLocaleString()} reads`}
                            ></div>
                          )}
                          {groupedClosedRefMarkerGenes.SSU.eukarya.read_count >
                            0 && (
                            <div
                              className="stacked-bar-segment eukarya-bar"
                              style={{
                                width: `${
                                  (groupedClosedRefMarkerGenes.SSU.eukarya
                                    .read_count /
                                    groupedClosedRefMarkerGenes.SSU
                                      .total_read_count) *
                                  100
                                }%`,
                              }}
                              title={`Eukarya: ${groupedClosedRefMarkerGenes.SSU.eukarya.read_count.toLocaleString()} reads`}
                            ></div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>

            <tr
              className={`vf-table__row ${
                groupedClosedRefMarkerGenes.LSU.has_majority
                  ? 'majority-marker-row'
                  : ''
              }`}
            >
              <td className="vf-table__cell">
                <div className="marker-name-container">
                  LSU
                  {groupedClosedRefMarkerGenes.LSU.has_majority && (
                    <span
                      className="majority-marker-badge"
                      title="Majority Marker"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </td>

              <td className="vf-table__cell">
                {groupedClosedRefMarkerGenes.LSU.bacteria.read_count > 0 ? (
                  <span className="read-count-value bacteria-count">
                    {groupedClosedRefMarkerGenes.LSU.bacteria.read_count.toLocaleString()}
                  </span>
                ) : (
                  <span className="na-value">N/A</span>
                )}
              </td>

              <td className="vf-table__cell">
                {groupedClosedRefMarkerGenes.LSU.archaea.read_count > 0 ? (
                  <span className="read-count-value archaea-count">
                    {groupedClosedRefMarkerGenes.LSU.archaea.read_count.toLocaleString()}
                  </span>
                ) : (
                  <span className="na-value">N/A</span>
                )}
              </td>

              <td className="vf-table__cell">
                {groupedClosedRefMarkerGenes.LSU.eukarya.read_count > 0 ? (
                  <span className="read-count-value eukarya-count">
                    {groupedClosedRefMarkerGenes.LSU.eukarya.read_count.toLocaleString()}
                  </span>
                ) : (
                  <span className="na-value">N/A</span>
                )}
              </td>

              <td className="vf-table__cell view-buttons-cell">
                {groupedClosedRefMarkerGenes.LSU.view_available &&
                groupedClosedRefMarkerGenes.LSU.total_read_count > 0 ? (
                  <button
                    type="button"
                    className="vf-search__button | vf-button vf-button--primary mg-text-search-button vf-button--sm"
                    onClick={() => handleViewClick('closed_ref', 'LSU')}
                  >
                    <span
                      className="icon icon-common icon-check-circle"
                      style={{ color: '#dcfce7' }}
                    />
                    <span className="vf-button__text">View</span>
                  </button>
                ) : (
                  <div className="not-available">
                    <span
                      className="icon icon-common icon-minus-circle"
                      style={{ color: 'grey' }}
                    />
                    <span className="vf-button__text">Not calculated</span>
                  </div>
                )}
              </td>

              <td className="vf-table__cell">
                <div className="read-count-container">
                  <span className="read-count-value">
                    {groupedClosedRefMarkerGenes.LSU.total_read_count.toLocaleString()}
                  </span>

                  {groupedClosedRefMarkerGenes.LSU.total_read_count > 0 && (
                    <div className="read-count-bar-container">
                      <div
                        className="read-count-bar-background"
                        style={{
                          width: `${Math.min(
                            100,
                            (groupedClosedRefMarkerGenes.LSU.total_read_count /
                              maxClosedRefReadCount) *
                              100
                          )}%`,
                        }}
                      >
                        <div className="stacked-bar-container">
                          {groupedClosedRefMarkerGenes.LSU.bacteria.read_count >
                            0 && (
                            <div
                              className="stacked-bar-segment bacteria-bar"
                              style={{
                                width: `${
                                  (groupedClosedRefMarkerGenes.LSU.bacteria
                                    .read_count /
                                    groupedClosedRefMarkerGenes.LSU
                                      .total_read_count) *
                                  100
                                }%`,
                              }}
                              title={`Bacteria: ${groupedClosedRefMarkerGenes.LSU.bacteria.read_count.toLocaleString()} reads`}
                            ></div>
                          )}
                          {groupedClosedRefMarkerGenes.LSU.archaea.read_count >
                            0 && (
                            <div
                              className="stacked-bar-segment archaea-bar"
                              style={{
                                width: `${
                                  (groupedClosedRefMarkerGenes.LSU.archaea
                                    .read_count /
                                    groupedClosedRefMarkerGenes.LSU
                                      .total_read_count) *
                                  100
                                }%`,
                              }}
                              title={`Archaea: ${groupedClosedRefMarkerGenes.LSU.archaea.read_count.toLocaleString()} reads`}
                            ></div>
                          )}
                          {groupedClosedRefMarkerGenes.LSU.eukarya.read_count >
                            0 && (
                            <div
                              className="stacked-bar-segment eukarya-bar"
                              style={{
                                width: `${
                                  (groupedClosedRefMarkerGenes.LSU.eukarya
                                    .read_count /
                                    groupedClosedRefMarkerGenes.LSU
                                      .total_read_count) *
                                  100
                                }%`,
                              }}
                              title={`Eukarya: ${groupedClosedRefMarkerGenes.LSU.eukarya.read_count.toLocaleString()} reads`}
                            ></div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>

            <tr
              className={`vf-table__row ${
                groupedClosedRefMarkerGenes.ITS.has_majority
                  ? 'majority-marker-row'
                  : ''
              }`}
            >
              <td className="vf-table__cell">
                <div className="marker-name-container">
                  ITS
                  {groupedClosedRefMarkerGenes.ITS.has_majority && (
                    <span
                      className="majority-marker-badge"
                      title="Majority Marker"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </td>

              <td className="vf-table__cell">
                <span className="na-value">N/A</span>
              </td>
              <td className="vf-table__cell">
                <span className="na-value">N/A</span>
              </td>
              <td className="vf-table__cell">
                <span className="na-value">N/A</span>
              </td>

              <td className="vf-table__cell view-buttons-cell">
                {groupedClosedRefMarkerGenes.ITS.view_available &&
                groupedClosedRefMarkerGenes.ITS.total_read_count > 0 ? (
                  <button
                    type="button"
                    className="vf-search__button | vf-button vf-button--primary mg-text-search-button vf-button--sm"
                    onClick={() => handleViewClick('closed_ref', 'ITS')}
                  >
                    <span
                      className="icon icon-common icon-check-circle"
                      style={{ color: '#dcfce7' }}
                    />
                    <span className="vf-button__text">View</span>
                  </button>
                ) : (
                  <div className="not-available">
                    <span
                      className="icon icon-common icon-minus-circle"
                      style={{ color: 'grey' }}
                    />
                    <span className="vf-button__text">Not calculated</span>
                  </div>
                )}
              </td>

              <td className="vf-table__cell">
                <div className="read-count-container">
                  <span className="read-count-value">
                    {groupedClosedRefMarkerGenes.ITS.total_read_count.toLocaleString()}
                  </span>

                  {groupedClosedRefMarkerGenes.ITS.total_read_count > 0 && (
                    <div className="read-count-bar-container">
                      <div
                        className="read-count-bar-background"
                        style={{
                          width: `${Math.min(
                            100,
                            (groupedClosedRefMarkerGenes.ITS.total_read_count /
                              maxClosedRefReadCount) *
                              100
                          )}%`,
                        }}
                      >
                        <div
                          className="stacked-bar-segment its-bar"
                          style={{ width: '100%' }}
                          title={`ITS: ${groupedClosedRefMarkerGenes.ITS.total_read_count.toLocaleString()} reads`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="marker-legend">
          <div className="marker-legend-title">Read count color legend:</div>
          <div className="marker-legend-items">
            <div className="marker-legend-item">
              <div className="marker-legend-color bacteria-color"></div>
              <div className="marker-legend-label">Bacteria</div>
            </div>
            <div className="marker-legend-item">
              <div className="marker-legend-color archaea-color"></div>
              <div className="marker-legend-label">Archaea</div>
            </div>
            <div className="marker-legend-item">
              <div className="marker-legend-color eukarya-color"></div>
              <div className="marker-legend-label">Eukarya</div>
            </div>
          </div>
        </div>
      </details>

      <details
        className="vf-details taxonomy-detail-with-nav"
        open
        ref={visualizationRef}
      >
        <summary className="vf-details--summary custom-vf-details--summary">
          Analysis Visualization
        </summary>

        <div className="taxonomy-detail-content">
          <div className="taxonomy-nav">
            <details className="vf-details" open ref={asvDetailsRef}>
              <summary
                className="vf-details--summary custom-vf-details-summary"
                id="taxonomy-asv"
              >
                ASV Taxonomy
              </summary>
              <ul className="taxonomy-nav-list">
                {uniqueAsvNavItems.map((analysis) => (
                  <li
                    key={analysis.id}
                    className={`taxonomy-nav-item ${
                      activeNavItem === `asv-${analysis.id}` &&
                      activeCategory === 'taxonomy-asv'
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      handleNavItemClick(
                        `asv-${analysis.id}`,
                        'taxonomy-asv',
                        analysis.contents
                      )
                    }
                  >
                    <span className="taxonomy-nav-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7 10C7.55228 10 8 9.55228 8 9C8 8.44772 7.55228 8 7 8C6.44772 8 6 8.44772 6 9C6 9.55228 6.44772 10 7 10Z"
                          fill="currentColor"
                        />
                        <path
                          d="M7 16C7.55228 16 8 15.5523 8 15C8 14.4477 7.55228 14 7 14C6.44772 14 6 14.4477 6 15C6 15.5523 6.44772 16 7 16Z"
                          fill="currentColor"
                        />
                        <path
                          d="M13 10C13.5523 10 14 9.55228 14 9C14 8.44772 13.5523 8 13 8C12.4477 8 12 8.44772 12 9C12 9.55228 12.4477 10 13 10Z"
                          fill="currentColor"
                        />
                        <path
                          d="M13 16C13.5523 16 14 15.5523 14 15C14 14.4477 13.5523 14 13 14C12.4477 14 12 14.4477 12 15C12 15.5523 12.4477 16 13 16Z"
                          fill="currentColor"
                        />
                        <path
                          d="M19 10C19.5523 10 20 9.55228 20 9C20 8.44772 19.5523 8 19 8C18.4477 8 18 8.44772 18 9C18 9.55228 18.4477 10 19 10Z"
                          fill="currentColor"
                        />
                        <path
                          d="M19 16C19.5523 16 20 15.5523 20 15C20 14.4477 19.5523 14 19 14C18.4477 14 18 14.4477 18 15C18 15.5523 18.4477 16 19 16Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                    <span className="taxonomy-nav-text">{analysis.label}</span>
                  </li>
                ))}
              </ul>
            </details>

            <details className="vf-details" open ref={closedRefDetailsRef}>
              <summary
                className="vf-details--summary custom-vf-details--summary"
                id="taxonomy-closed-ref"
              >
                Closed Reference Taxonomy
              </summary>
              <ul className="taxonomy-nav-list">
                {uniqueClosedRefNavItems.map((analysis) => (
                  <li
                    key={analysis.id}
                    className={`taxonomy-nav-item ${
                      activeNavItem === `closed-ref-${analysis.id}` &&
                      activeCategory === 'taxonomy-closed-ref'
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      handleNavItemClick(
                        `closed-ref-${analysis.id}`,
                        'taxonomy-closed-ref',
                        analysis.contents
                      )
                    }
                  >
                    <span className="taxonomy-nav-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M3 5H21V7H3V5Z" fill="currentColor" />
                        <path d="M3 11H21V13H3V11Z" fill="currentColor" />
                        <path d="M3 17H21V19H3V17Z" fill="currentColor" />
                      </svg>
                    </span>
                    <span className="taxonomy-nav-text">{analysis.label}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <div className="taxonomy-content-area">
            {activeContent && activeContent.length > 0 ? (
              activeContent.map((file, index) =>
                renderVisualizationCard(file, index)
              )
            ) : (
              <div className="no-content-message">
                <p>
                  Select an analysis type from the left navigation to view its
                  details.
                </p>
              </div>
            )}
          </div>
        </div>
      </details>
    </div>
  );
};

export default Taxonomy;
