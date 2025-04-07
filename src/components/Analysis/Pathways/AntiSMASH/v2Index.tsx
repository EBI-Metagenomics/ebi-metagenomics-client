import React, { useCallback, useContext, useEffect, useState } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import { TAXONOMY_COLOURS } from 'utils/taxon';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import { BGZipService } from 'components/Analysis/BgZipService';

// Define the interface for antiSMASH cluster data
interface AntiSmashCluster {
  classId: string;
  description: string;
  count: number;
}

const AntiSmashSubpage: React.FC = () => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);
  const [colorMap] = useState(new Map());
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  const [bgzipService, setBgzipService] = useState<BGZipService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [antiSmashData, setAntiSmashData] = useState<AntiSmashCluster[]>([]);

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
    (file) => file.alias.includes === 'antismash' && file.file_type === 'tsv.gz'
  );

  const dataFileUrl = dataFile?.url;
  const indexFileUrl = `${dataFileUrl}.gzi`;

  const totalCount = antiSmashData.reduce(
    (sum, cluster) => sum + cluster.count,
    0
  );

  // Parse antiSMASH data from TSV
  const parseAntiSmashData = useCallback((text: string): AntiSmashCluster[] => {
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) return [];

    let headerLine = lines[0];
    let dataLines = lines;

    const rawHeaderLine = headerLine.toLowerCase();

    // Check if the first line is a header
    if (
      !rawHeaderLine.includes('class_id') &&
      !rawHeaderLine.includes('description') &&
      !rawHeaderLine.includes('count')
    ) {
      headerLine = 'class_id\tdescription\tcount';
    } else {
      dataLines = lines.slice(1);
    }

    const headers = headerLine.split('\t');

    const colIndices = {
      classId: headers.findIndex((h) => h.includes('class_id')),
      description: headers.findIndex((h) => h.includes('description')),
      count: headers.findIndex((h) => h.includes('count')),
    };

    if (colIndices.classId === -1) colIndices.classId = 0;
    if (colIndices.description === -1) colIndices.description = 1;
    if (colIndices.count === -1) colIndices.count = 2;

    return dataLines
      .map((line) => {
        const values = line.split('\t');
        if (values.length < 3) return null; // Skip malformed lines

        return {
          classId: values[colIndices.classId] || '',
          description: values[colIndices.description] || '',
          count: parseInt(values[colIndices.count] || '0', 10),
        };
      })
      .filter(Boolean) as AntiSmashCluster[];
  }, []);

  const loadPage = useCallback(
    async (page: number) => {
      if (!bgzipService) return;
      try {
        setIsLoading(true);
        const rawData = await bgzipService.getPageData(page, pageSize);
        const parsedData = parseAntiSmashData(rawData);

        const sortedData = [...parsedData].sort((a, b) => b.count - a.count);

        setAntiSmashData(sortedData);
        setCurrentPage(page);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    },
    [bgzipService, parseAntiSmashData]
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isLoading) return;
    loadPage(newPage);
  };

  useEffect(() => {
    const service = new BGZipService(dataFileUrl, indexFileUrl, {
      avgBytesPerRecord: 100,
      onLog: (msg) => console.log(`[BGZip] ${msg}`),
      onError: (msg) => console.error(`[BGZip Error] ${msg}`),
    });

    setBgzipService(service);

    return () => {
      service.dispose();
    };
  }, [dataFileUrl, indexFileUrl]);

  useEffect(() => {
    const initializeService = async () => {
      if (!bgzipService) return;

      try {
        setIsLoading(true);

        const success = await bgzipService.initialize();
        if (!success) {
          setError('Failed to initialize BGZip service');
          setIsLoading(false);
          return;
        }

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
  }, [bgzipService, loadPage]);

  // Get unique color for each cluster type
  const getClusterColor = (classId: string): string => {
    if (!colorMap.has(classId)) {
      const index = Array.from(colorMap.keys()).length;
      colorMap.set(classId, TAXONOMY_COLOURS[index % TAXONOMY_COLOURS.length]);
    }
    return colorMap.get(classId) || TAXONOMY_COLOURS[0];
  };

  // Loading state
  if (isLoading && antiSmashData.length === 0) {
    return (
      <div className="vf-stack vf-stack--400 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          <p className="mt-2">Loading antiSMASH cluster data...</p>
          <p className="text-sm text-gray-500 mt-1">
            Accessing data using BGZip index
          </p>
        </div>
      </div>
    );
  }

  // Error state
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
    <div className="vf-stack vf-stack--400">
      <h1 className="vf-text vf-text--heading-l">
        antiSMASH Secondary Metabolite Analysis
      </h1>

      <div className="mb-4 text-sm text-gray-600 text-center">
        <p>
          Using BGZip indexed access ({fileStats.totalBlocks} blocks,{' '}
          {(fileStats.totalSize / (1024 * 1024)).toFixed(2)} MB)
          {fileStats.totalRecords &&
            ` - Approximately ${fileStats.totalRecords} records`}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 my-6">
        {/* Summary Cards */}
        <article className="vf-card vf-card--brand vf-card--bordered rounded-lg shadow-sm">
          <div className="vf-card__content | vf-stack vf-stack--400">
            <div className="flex items-center">
              <span className="text-blue-500 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                </svg>
              </span>
              <div>
                <h3 className="vf-card__heading text-lg">
                  <span className="vf-card__link text-2xl">
                    {antiSmashData.length}
                  </span>
                </h3>
                <p className="vf-card__text text-sm">Cluster Types</p>
              </div>
            </div>
          </div>
        </article>

        <article className="vf-card vf-card--brand vf-card--bordered rounded-lg shadow-sm">
          <div className="vf-card__content | vf-stack vf-stack--400">
            <div className="flex items-center">
              <span className="text-green-500 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <div>
                <h3 className="vf-card__heading text-lg">
                  <span className="vf-card__link text-2xl">{totalCount}</span>
                </h3>
                <p className="vf-card__text text-sm">Total Clusters</p>
              </div>
            </div>
          </div>
        </article>

        {antiSmashData.length > 0 && (
          <article className="vf-card vf-card--brand vf-card--bordered rounded-lg shadow-sm">
            <div className="vf-card__content | vf-stack vf-stack--400">
              <div className="flex items-center">
                <span className="text-purple-500 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </span>
                <div>
                  <h3 className="vf-card__heading text-lg">
                    <span className="vf-card__link text-2xl">
                      {antiSmashData[0]?.count || 0}
                    </span>
                  </h3>
                  <p className="vf-card__text text-sm">
                    {antiSmashData[0]?.classId || ''} Clusters
                  </p>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>

      <details className="vf-details" open>
        <summary className="vf-details--summary bg-gray-100 hover:bg-gray-200 transition-colors">
          <span className="font-medium">
            Secondary Metabolite Cluster Types
          </span>
        </summary>
        <div className="p-4 bg-white rounded-b-lg border border-gray-200 shadow-sm">
          <div className="flex flex-wrap gap-4 mb-4">
            {antiSmashData.map((cluster) => (
              <div
                key={cluster.classId}
                className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50"
                onClick={() =>
                  setSelectedCluster(
                    cluster.classId === selectedCluster ? null : cluster.classId
                  )
                }
              >
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: getClusterColor(cluster.classId) }}
                />
                <span
                  className={`font-medium ${
                    selectedCluster === cluster.classId ? 'text-blue-600' : ''
                  }`}
                >
                  {cluster.classId}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  ({cluster.count})
                </span>
              </div>
            ))}
          </div>

          {totalCount > 0 && (
            <div className="my-6">
              <div className="w-full bg-gray-100 rounded-lg h-8 relative">
                {antiSmashData.map((cluster, index, arr) => {
                  const prevWidth = arr
                    .slice(0, index)
                    .reduce((sum, c) => sum + (c.count / totalCount) * 100, 0);
                  const width = (cluster.count / totalCount) * 100;

                  return (
                    <div
                      key={cluster.classId}
                      className="absolute top-0 bottom-0 border-r border-white last:border-r-0"
                      style={{
                        left: `${prevWidth}%`,
                        width: `${width}%`,
                        backgroundColor: getClusterColor(cluster.classId),
                        opacity:
                          selectedCluster === cluster.classId
                            ? 1
                            : selectedCluster
                            ? 0.3
                            : 0.8,
                      }}
                      onMouseEnter={() => setSelectedCluster(cluster.classId)}
                      onMouseLeave={() => setSelectedCluster(null)}
                      title={`${cluster.description}: ${
                        cluster.count
                      } (${width.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Relative distribution of secondary metabolite cluster types
              </div>
            </div>
          )}
        </div>
      </details>

      <details className="vf-details">
        <summary className="vf-details--summary bg-gray-100 hover:bg-gray-200 transition-colors">
          <span className="font-medium">Cluster Details</span>
        </summary>
        <DetailedVisualisationCard>
          <div className="vf-card__content | vf-stack vf-stack--400">
            <div className="border-b pb-3 mb-4">
              <h2 className="vf-card__heading">antiSMASH Cluster Analysis</h2>
              <p className="vf-card__subheading text-gray-600">
                Secondary metabolite biosynthetic gene clusters identified in
                the metagenome
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="vf-table w-full">
                <thead className="vf-table__header bg-gray-50">
                  <tr className="vf-table__row">
                    <th className="vf-table__heading">Class ID</th>
                    <th className="vf-table__heading">Description</th>
                    <th className="vf-table__heading text-right">Count</th>
                    <th className="vf-table__heading text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody className="vf-table__body">
                  {antiSmashData.map((cluster) => (
                    <tr
                      className={`vf-table__row hover:bg-gray-50 ${
                        selectedCluster === cluster.classId ? 'bg-blue-50' : ''
                      }`}
                      key={cluster.classId}
                      onMouseEnter={() => setSelectedCluster(cluster.classId)}
                      onMouseLeave={() => setSelectedCluster(null)}
                    >
                      <td className="vf-table__cell font-medium">
                        {cluster.classId}
                      </td>
                      <td className="vf-table__cell">{cluster.description}</td>
                      <td className="vf-table__cell text-right font-medium">
                        {cluster.count}
                      </td>
                      <td className="vf-table__cell text-right">
                        {totalCount > 0
                          ? ((cluster.count / totalCount) * 100).toFixed(1)
                          : '0.0'}
                        %
                        <div className="w-16 inline-block ml-2 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width:
                                totalCount > 0
                                  ? `${(cluster.count / totalCount) * 100}%`
                                  : '0%',
                              backgroundColor: getClusterColor(cluster.classId),
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {antiSmashData.length === 0 && (
                    <tr className="vf-table__row">
                      <td
                        colSpan={4}
                        className="vf-table__cell text-center py-8 text-gray-500"
                      >
                        No antiSMASH clusters found
                      </td>
                    </tr>
                  )}
                </tbody>
                {antiSmashData.length > 0 && (
                  <tfoot className="vf-table__footer bg-gray-100">
                    <tr className="vf-table__row">
                      <td className="vf-table__cell" colSpan={2}>
                        <strong>Total</strong>
                      </td>
                      <td className="vf-table__cell text-right">
                        <strong>{totalCount}</strong>
                      </td>
                      <td className="vf-table__cell text-right">
                        <strong>100%</strong>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
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
                          currentPage === 1
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
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
                          currentPage === 1
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
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
              </div>
            )}

            {/* Page status information */}
            <div className="text-sm text-gray-500 mt-2 text-center">
              Showing page {currentPage} of {totalPages} (
              {isLoading ? 'Loading...' : `${antiSmashData.length} records`})
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium mb-2">About Secondary Metabolites</h3>
              <p className="text-sm text-gray-700 mb-3">
                Secondary metabolites are organic compounds produced by
                bacteria, fungi, or plants which are not directly involved in
                the normal growth, development, or reproduction of the organism.
              </p>
              <p className="text-sm text-gray-700">
                <strong>antiSMASH</strong> (antibiotics & Secondary Metabolite
                Analysis Shell) identifies and analyzes biosynthetic gene
                clusters in bacterial and fungal genomes, providing detailed
                information about secondary metabolite biosynthesis.
              </p>
            </div>
          </div>
        </DetailedVisualisationCard>
      </details>
    </div>
  );
};

export default AntiSmashSubpage;
