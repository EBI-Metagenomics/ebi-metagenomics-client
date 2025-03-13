import React from 'react';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

const InterProTableWithPagination = () => {
  const domainData = [
    {
      id: 'IPR036388',
      entryName: 'Winged helix-like DNA-binding domain superfamily',
      pCDSMatched: 5225,
      percentage: 1.46,
      color: '#8dd3c7',
    },
    {
      id: 'IPR003439',
      entryName: 'ABC transporter-like',
      pCDSMatched: 3077,
      percentage: 0.86,
      color: '#f9d5e5',
    },
    {
      id: 'IPR013785',
      entryName: 'Aldolase-type TIM barrel',
      pCDSMatched: 3070,
      percentage: 0.86,
      color: '#ffb178',
    },
    {
      id: 'IPR013783',
      entryName: 'Immunoglobulin-like fold',
      pCDSMatched: 2677,
      percentage: 0.75,
      color: '#5e9a8e',
    },
    {
      id: 'IPR036890',
      entryName: 'Histidine kinase/HSP90-like ATPase superfamily',
      pCDSMatched: 2332,
      percentage: 0.65,
      color: '#d2b48c',
    },
    {
      id: 'IPR017871',
      entryName: 'ABC transporter, conserved site',
      pCDSMatched: 2034,
      percentage: 0.57,
      color: '#f7f7a3',
    },
    {
      id: 'IPR014729',
      entryName: 'Rossmann-like alpha/beta/alpha sandwich fold',
      pCDSMatched: 1918,
      percentage: 0.54,
      color: '#8787c5',
    },
    {
      id: 'IPR001789',
      entryName: 'Signal transduction response regulator, receiver domain',
      pCDSMatched: 1904,
      percentage: 0.53,
      color: '#e3f5e1',
    },
    {
      id: 'IPR029044',
      entryName: 'Nucleotide-diphospho-sugar transferases',
      pCDSMatched: 1864,
      percentage: 0.52,
      color: '#9ab973',
    },
    {
      id: 'IPR003594',
      entryName: 'Histidine kinase-like ATPase, C-terminal domain',
      pCDSMatched: 1705,
      percentage: 0.48,
      color: '#e6e6fa',
    },
  ];

  // Define styles for color squares
  const colorSquareStyle = {
    width: '24px',
    height: '24px',
    display: 'inline-block',
    borderRadius: '4px',
    border: '1px solid rgba(0,0,0,0.1)',
  };

  return (
    <div className="interpro-container">
      <details className="vf-details" open>
        <summary className="vf-details--summary">
          InterPro Domain Summary
        </summary>
        <div className="flex flex-wrap gap-4 my-4">
          {/* Summary Card */}
          <article className="vf-card vf-card--brand vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--400">
              <h3 className="vf-card__heading">
                <span className="vf-card__link">1,299</span>
              </h3>
              <p className="vf-card__text">
                Predicted CDS with InterProScan matches
              </p>
            </div>
          </article>

          {/* Additional summary card */}
          <article className="vf-card vf-card--bordered">
            <div className="vf-card__content | vf-stack vf-stack--400">
              <h3 className="vf-card__heading">
                <span className="vf-card__link">92</span>
              </h3>
              <p className="vf-card__text">Total unique InterPro domains</p>
            </div>
          </article>
        </div>

        {/* Table Component */}
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="vf-table w-full">
              <thead className="vf-table__header">
                <tr className="vf-table__row">
                  <th className="vf-table__heading" style={{ width: '40px' }}>
                    {/* Color indicator column */}
                  </th>
                  <th className="vf-table__heading">Entry name</th>
                  <th className="vf-table__heading">ID</th>
                  <th className="vf-table__heading text-right">pCDS matched</th>
                  <th className="vf-table__heading text-right">%</th>
                </tr>
              </thead>
              <tbody className="vf-table__body">
                {domainData.map((domain) => (
                  <tr
                    className="vf-table__row hover:bg-gray-50"
                    key={domain.id}
                  >
                    <td className="vf-table__cell">
                      <div
                        className="color-indicator"
                        style={{
                          ...colorSquareStyle,
                          backgroundColor: domain.color,
                        }}
                        title={`Color indicator for ${domain.entryName}`}
                      ></div>
                    </td>
                    <td className="vf-table__cell font-medium">
                      {domain.entryName}
                    </td>
                    <td className="vf-table__cell">
                      <a
                        href={`https://www.ebi.ac.uk/interpro/entry/InterPro/${domain.id}`}
                        className="text-blue-600 hover:underline flex items-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {domain.id}
                        <ExternalLink size={14} className="ml-1 opacity-70" />
                      </a>
                    </td>
                    <td className="vf-table__cell text-right">
                      {domain.pCDSMatched.toLocaleString()}
                    </td>
                    <td className="vf-table__cell text-right">
                      {domain.percentage.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center">
            <nav className="vf-pagination" aria-label="Pagination">
              <ul className="vf-pagination__list flex items-center gap-1">
                <li className="vf-pagination__item vf-pagination__item--previous-page">
                  <a
                    href="JavaScript:Void(0);"
                    className="vf-pagination__link flex items-center"
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    Previous
                  </a>
                </li>
                <li className="vf-pagination__item">
                  <a href="JavaScript:Void(0);" className="vf-pagination__link">
                    1
                  </a>
                </li>
                <li className="vf-pagination__item">
                  <a href="JavaScript:Void(0);" className="vf-pagination__link">
                    2
                  </a>
                </li>
                <li className="vf-pagination__item">
                  <span className="vf-pagination__label">...</span>
                </li>
                <li className="vf-pagination__item">
                  <a href="JavaScript:Void(0);" className="vf-pagination__link">
                    17
                  </a>
                </li>
                <li className="vf-pagination__item vf-pagination__item--is-active">
                  <span className="vf-pagination__label" aria-current="page">
                    18
                  </span>
                </li>
                <li className="vf-pagination__item">
                  <a href="JavaScript:Void(0);" className="vf-pagination__link">
                    19
                  </a>
                </li>
                <li className="vf-pagination__item vf-pagination__item--next-page">
                  <a
                    href="JavaScript:Void(0);"
                    className="vf-pagination__link flex items-center"
                  >
                    Next
                    <ArrowRight size={16} className="ml-1" />
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 p-4 mt-4 border-t border-gray-200">
          <h3 className="font-medium mb-2 text-sm">Legend:</h3>
          <div className="text-sm text-gray-600">
            <p>
              <strong>pCDS matched:</strong> Number of predicted coding
              sequences matching this InterPro domain
            </p>
            <p>
              <strong>%:</strong> Percentage of all predicted coding sequences
              containing this domain
            </p>
            <p>
              <strong>Color squares:</strong> Visual identifiers for domains in
              graphical representations
            </p>
          </div>
        </div>
      </details>
    </div>
  );
};

export default InterProTableWithPagination;
