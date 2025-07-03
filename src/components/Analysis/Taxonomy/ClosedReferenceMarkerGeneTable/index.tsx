import React from 'react';

type OrganismData = {
  read_count: number;
  majority_marker: boolean;
};

type ClosedRefMarkerData = {
  bacteria?: OrganismData;
  archaea?: OrganismData;
  eukarya?: OrganismData;
  total_read_count: number;
  has_majority: boolean;
  view_available: boolean;
  is_its?: boolean;
};

type ClosedRefMarkerGenes = {
  SSU: ClosedRefMarkerData;
  LSU: ClosedRefMarkerData;
  ITS: ClosedRefMarkerData & { is_its: boolean };
};

type ClosedRefMarkerGeneTableProps = {
  groupedClosedRefMarkerGenes: ClosedRefMarkerGenes;
  maxClosedRefReadCount: number;
  handleViewClick: (analysisType: string, markerType: string) => void;
};

const ClosedReferenceMarkerGeneTable: React.FC<
  ClosedRefMarkerGeneTableProps
> = ({
  groupedClosedRefMarkerGenes,
  maxClosedRefReadCount,
  handleViewClick,
}) => {
  return (
    <>
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
          {/* SSU Row */}
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
                          />
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
                          />
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
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </td>
          </tr>

          {/* LSU Row */}
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
                          />
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
                          />
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
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </td>
          </tr>

          {/* ITS Row */}
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
                      />
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
            <div className="marker-legend-color bacteria-color" />
            <div className="marker-legend-label">Bacteria</div>
          </div>
          <div className="marker-legend-item">
            <div className="marker-legend-color archaea-color" />
            <div className="marker-legend-label">Archaea</div>
          </div>
          <div className="marker-legend-item">
            <div className="marker-legend-color eukarya-color" />
            <div className="marker-legend-label">Eukarya</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClosedReferenceMarkerGeneTable;
