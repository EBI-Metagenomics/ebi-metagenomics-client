import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

import { BGZipService } from 'components/Analysis/BgZipService';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

const InterProTableWithPagination = () => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);
  const [bgzipService, setBgzipService] = useState<BGZipService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  interface InterProDomain {
    id: string;
    entryName: string;
    color: string;
    pCDSMatched: number;
    percentage: number;
  }
  const [interProDomainData, setInterProDomainData] = useState<
    InterProDomain[]
  >([]);

  const [fileStats, setFileStats] = useState<{
    totalSize: number;
    totalBlocks: number;
    totalRecords: number | null;
  }>({
    totalSize: 0,
    totalBlocks: 0,
    totalRecords: null,
  });

  const pageSize = 50;

  const dataFile = analysisOverviewData.downloads.find(
    (file) => file.alias.includes === 'interpro' && file.file_type === 'tsv.gz'
  );
  const dataFileUrl = dataFile?.url;
  const indexFileUrl = `${dataFileUrl}.gzi`;

  const parseInterProData = useCallback((text: string): InterProDomain[] => {
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) return [];

    let headerLine = lines[0];
    let dataLines = lines;

    const rawHeaderLine = headerLine.toLowerCase();

    if (
      !rawHeaderLine.includes('count') &&
      !rawHeaderLine.includes('interpro_accession') &&
      !rawHeaderLine.includes('description')
    ) {
      headerLine = 'count\tinterpro_accession\tdescription';
    } else {
      dataLines = lines.slice(1);
    }

    const headers = headerLine.split('\t');

    const colIndices = {
      count: headers.findIndex((h) => h.includes('count')),
      interpro_accession: headers.findIndex((h) =>
        h.includes('interpro_accession')
      ),
      description: headers.findIndex((h) => h.includes('description')),
    };

    return dataLines
      .map((line) => {
        const values = line.split('\t');
        return {
          id: values[colIndices.interpro_accession],
          entryName: values[colIndices.description],
          pCDSMatched: parseInt(values[colIndices.count], 10),
          percentage: 0,
          color: '#000000',
        };
      })
      .filter(Boolean) as InterProDomain[];
  }, []);

  const loadPage = useCallback(
    async (page: number) => {
      if (!bgzipService) return;
      try {
        setIsLoading(true);
        console.log('local pageSize ', pageSize);
        const rawData = await bgzipService.getPageData(page, pageSize);
        // const interProData = parseInterProData(rawData);
        const interProData = await bgzipService.getPagedData(
          page,
          pageSize,
          parseInterProData
        );
        setInterProDomainData(interProData);
        setCurrentPage(page);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    },
    [bgzipService, parseInterProData]
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isLoading) {
      return;
    }
    console.log('THIS IS NEW PAGE ', newPage);
    loadPage(newPage);
  };

  useEffect(() => {
    const service = new BGZipService(dataFileUrl, indexFileUrl, {
      avgBytesPerRecord: 100,
      onLog: (msg) => console.log(`[BGZip] ${msg}`),
      onError: (msg) => console.error(`[BGZip Error] ${msg}`),
    });

    setBgzipService(service);

    // Clean up service on unmount
    return () => {
      service.dispose();
    };
  }, [dataFileUrl, indexFileUrl]);

  // Initialize service
  useEffect(() => {
    const initializeService = async () => {
      if (!bgzipService) return;

      try {
        setIsLoading(true);

        // Initialize the service
        const success = await bgzipService.initialize();
        if (!success) {
          setError('Failed to initialize BGZip service');
          setIsLoading(false);
          return;
        }

        // Get file stats
        const stats = bgzipService.getFileStats();
        setFileStats(stats);

        // Calculate total pages
        const pages = bgzipService.getTotalPages(pageSize);
        setTotalPages(pages);

        // Load first page
        await loadPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      }
    };

    initializeService();
  }, [bgzipService]);

  // useEffect(() => {
  //   // examineFileStructure();
  //   loadPage(1);
  // }, [loadPage]);

  // Define styles for color squares
  const colorSquareStyle = {
    width: '24px',
    height: '24px',
    display: 'inline-block',
    borderRadius: '4px',
    border: '1px solid rgba(0,0,0,0.1)',
  };

  if (isLoading && interProDomainData.length === 0) {
    return (
      <div className="vf-stack vf-stack--400 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          <p className="mt-2">Loading KEGG pathway data...</p>
          <p className="text-sm text-gray-500 mt-1">
            Accessing data using BGZip index
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="vf-stack vf-stack--400">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-sm">
          <h1 className="vf-text vf-text--heading-l text-center mb-6 text-red-600">
            Error Loading Data
          </h1>
          <p className="text-center">{error}</p>
          <div className="mt-4 text-center">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              onClick={() => {
                setError(null);
                loadPage(1);
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="mb-4 text-sm text-gray-600 text-center">
          <p>
            Using BGZip indexed access ({fileStats.totalBlocks} blocks,{' '}
            {(fileStats.totalSize / (1024 * 1024)).toFixed(2)} MB)
            {fileStats.totalRecords &&
              ` - Approximately ${fileStats.totalRecords} records`}
          </p>
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
                {interProDomainData.map((domain) => (
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
                      />
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
          {/* <div className="mt-4 flex justify-center"> */}
          {/*   <nav className="vf-pagination" aria-label="Pagination"> */}
          {/*     <ul className="vf-pagination__list flex items-center gap-1"> */}
          {/*       <li className="vf-pagination__item vf-pagination__item--previous-page"> */}
          {/*         <a */}
          {/*           href="JavaScript:Void(0);" */}
          {/*           className="vf-pagination__link flex items-center" */}
          {/*         > */}
          {/*           <ArrowLeft size={16} className="mr-1" /> */}
          {/*           Previous */}
          {/*         </a> */}
          {/*       </li> */}
          {/*       <li className="vf-pagination__item"> */}
          {/*         <a href="JavaScript:Void(0);" className="vf-pagination__link"> */}
          {/*           1 */}
          {/*         </a> */}
          {/*       </li> */}
          {/*       <li className="vf-pagination__item"> */}
          {/*         <a href="JavaScript:Void(0);" className="vf-pagination__link"> */}
          {/*           2 */}
          {/*         </a> */}
          {/*       </li> */}
          {/*       <li className="vf-pagination__item"> */}
          {/*         <span className="vf-pagination__label">...</span> */}
          {/*       </li> */}
          {/*       <li className="vf-pagination__item"> */}
          {/*         <a href="JavaScript:Void(0);" className="vf-pagination__link"> */}
          {/*           17 */}
          {/*         </a> */}
          {/*       </li> */}
          {/*       <li className="vf-pagination__item vf-pagination__item--is-active"> */}
          {/*         <span className="vf-pagination__label" aria-current="page"> */}
          {/*           18 */}
          {/*         </span> */}
          {/*       </li> */}
          {/*       <li className="vf-pagination__item"> */}
          {/*         <a href="JavaScript:Void(0);" className="vf-pagination__link"> */}
          {/*           19 */}
          {/*         </a> */}
          {/*       </li> */}
          {/*       <li className="vf-pagination__item vf-pagination__item--next-page"> */}
          {/*         <a */}
          {/*           href="JavaScript:Void(0);" */}
          {/*           className="vf-pagination__link flex items-center" */}
          {/*         > */}
          {/*           Next */}
          {/*           <ArrowRight size={16} className="ml-1" /> */}
          {/*         </a> */}
          {/*       </li> */}
          {/*     </ul> */}
          {/*   </nav> */}
          {/* </div> */}
          <div className="mt-4 flex justify-center">
            <nav className="vf-pagination" aria-label="Pagination">
              <ul className="vf-pagination__list flex items-center gap-1">
                {/* First page button */}
                <li className="vf-pagination__item">
                  <button
                    type="submit"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1 || isLoading}
                    className={`vf-pagination__link flex items-center ${
                      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label="Go to first page"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="11 17 6 12 11 7" />
                      <polyline points="18 17 13 12 18 7" />
                    </svg>
                  </button>
                </li>

                {/* Previous page button */}
                <li className="vf-pagination__item vf-pagination__item--previous-page">
                  <button
                    type="submit"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className={`vf-pagination__link flex items-center ${
                      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    Previous
                  </button>
                </li>

                {/* Generate page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // If near start, show first 5
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // If near end, show last 5
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Otherwise show 2 before and 2 after current
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <li
                      key={`page-${pageNum}`}
                      className={`vf-pagination__item ${
                        pageNum === currentPage
                          ? 'vf-pagination__item--is-active'
                          : ''
                      }`}
                    >
                      {pageNum === currentPage ? (
                        <span
                          className="vf-pagination__label"
                          aria-current="page"
                        >
                          {pageNum}
                        </span>
                      ) : (
                        <button
                          type="submit"
                          onClick={() => handlePageChange(pageNum)}
                          className="vf-pagination__link"
                          disabled={isLoading}
                        >
                          {pageNum}
                        </button>
                      )}
                    </li>
                  );
                })}

                {/* Show ellipsis if needed */}
                {totalPages > 5 && (
                  <>
                    {currentPage < totalPages - 2 && (
                      <li className="vf-pagination__item">
                        <span className="vf-pagination__label">...</span>
                      </li>
                    )}

                    {/* Always show the last page if not in view */}
                    {currentPage < totalPages - 2 && (
                      <li className="vf-pagination__item">
                        <button
                          type="submit"
                          onClick={() => handlePageChange(totalPages)}
                          className="vf-pagination__link"
                          disabled={isLoading}
                        >
                          {totalPages}
                        </button>
                      </li>
                    )}
                  </>
                )}

                {/* Next page button */}
                <li className="vf-pagination__item vf-pagination__item--next-page">
                  <button
                    type="submit"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className={`vf-pagination__link flex items-center ${
                      currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    Next
                    <ArrowRight size={16} className="ml-1" />
                  </button>
                </li>

                {/* Last page button */}
                <li className="vf-pagination__item">
                  <button
                    type="submit"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages || isLoading}
                    className={`vf-pagination__link flex items-center ${
                      currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    aria-label="Go to last page"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="13 17 18 12 13 7" />
                      <polyline points="6 17 11 12 6 7" />
                    </svg>
                  </button>
                </li>

                {/* Loading indicator */}
                {isLoading && (
                  <li className="vf-pagination__item ml-2">
                    <span className="inline-block w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin" />
                  </li>
                )}
              </ul>
            </nav>

            {/* Page status information */}
            <div className="text-sm text-gray-500 mt-2 text-center">
              Showing page {currentPage} of {totalPages} (
              {isLoading
                ? 'Loading...'
                : `${interProDomainData.length} records`}
              )
            </div>
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
