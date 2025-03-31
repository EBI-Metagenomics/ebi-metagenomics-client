import React, { useState, useEffect, useCallback, useContext } from 'react';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import { BGZipService } from 'components/Analysis/BgZipService';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

interface KOPathway {
  classId: string;
  name: string;
  description: string;
  completeness: number;
  matchingKO: string;
  missingKOs: string;
}

const KOTab: React.FC = () => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);
  const [bgzipService, setBgzipService] = useState<BGZipService | null>(null);

  const [koPathwayData, setKoPathwayData] = useState<KOPathway[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
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
    (file) => file.alias.includes === 'kegg' && file.file_type === 'tsv.gz'
  );
  const dataFileUrl = dataFile?.url;
  const indexFileUrl = `${dataFileUrl}.gzi`;

  const parsePathwayData = useCallback((text: string): KOPathway[] => {
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) return [];

    let headerLine = lines[0];
    let dataLines = lines;

    if (
      !headerLine.toLowerCase().includes('module_accession') &&
      !headerLine.includes('completeness') &&
      !headerLine.includes('pathway_name')
    ) {
      headerLine =
        'module_accession\tcompleteness\tpathway_name\tpathway_class\tmatching_ko\tmissing_ko';
    } else {
      dataLines = lines.slice(1);
    }

    const headers = headerLine.split('\t');

    const colIndices = {
      classId: headers.findIndex((h) => h.includes('module_accession')),
      completeness: headers.findIndex((h) => h.includes('completeness')),
      name: headers.findIndex((h) => h.includes('pathway_name')),
      description: headers.findIndex((h) => h.includes('pathway_class')),
      matchingKO: headers.findIndex((h) => h.includes('matching_ko')),
      missingKOs: headers.findIndex((h) => h.includes('missing_ko')),
    };

    if (colIndices.classId === -1) colIndices.classId = 0;
    if (colIndices.completeness === -1) colIndices.completeness = 1;
    if (colIndices.name === -1) colIndices.name = 2;
    if (colIndices.description === -1) colIndices.description = 3;
    if (colIndices.matchingKO === -1) colIndices.matchingKO = 4;
    if (colIndices.missingKOs === -1) colIndices.missingKOs = 5;

    const pathways = dataLines
      .map((line) => {
        const values = line.split('\t');
        if (values.length < 4) return null;

        return {
          classId: values[colIndices.classId] || '',
          completeness: parseFloat(values[colIndices.completeness] || '0'),
          name: values[colIndices.name] || 'Unknown',
          description: values[colIndices.description] || '',
          matchingKO: values[colIndices.matchingKO] || '',
          missingKOs: values[colIndices.missingKOs] || '',
        };
      })
      .filter(Boolean) as KOPathway[];

    return pathways.sort((a, b) => {
      if (b.completeness !== a.completeness) {
        return b.completeness - a.completeness;
      }
      return a.name.localeCompare(b.name);
    });
  }, []);

  const loadPage = useCallback(
    async (page: number) => {
      if (!bgzipService) return;

      try {
        setIsLoading(true);

        // Get data for this page
        const rawData = await bgzipService.getPageData(page, pageSize);

        // Parse the data
        const pathways = parsePathwayData(rawData);

        // Update state
        setKoPathwayData(pathways);
        setCurrentPage(page);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    },
    [bgzipService, parsePathwayData]
  );

  // Handle page changes
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
  // Initial load
  useEffect(() => {
    // examineFileStructure();
    loadPage(1);
  }, [loadPage]);

  // Group data by metabolism type for summary
  interface GroupedPathways {
    [key: string]: KOPathway[];
  }

  const groupedData = koPathwayData.reduce<GroupedPathways>((acc, pathway) => {
    const metabolismType =
      pathway.description.split(';')[1]?.trim() || 'Other metabolism';
    if (!acc[metabolismType]) {
      acc[metabolismType] = [];
    }
    acc[metabolismType].push(pathway);
    return acc;
  }, {});

  // Calculate summary statistics
  const totalPathways = koPathwayData.length;
  const totalMatchingKOs = koPathwayData.reduce(
    (sum, pathway) =>
      sum +
      (pathway.matchingKO
        ? pathway.matchingKO.split(',').filter((k) => k).length
        : 0),
    0
  );
  const completePathways = koPathwayData.filter(
    (pathway) => pathway.completeness === 100
  ).length;

  // Get the color for metabolism type
  const getMetabolismColor = (metabolismType: string): string => {
    const colorMap: { [key: string]: string } = {
      'Carbohydrate metabolism': 'bg-blue-100 border-blue-300',
      'Amino acid metabolism': 'bg-green-100 border-green-300',
      'Nucleotide metabolism': 'bg-purple-100 border-purple-300',
      'Lipid metabolism': 'bg-orange-100 border-orange-300',
      'Energy metabolism': 'bg-red-100 border-red-300',
      'Metabolism of cofactors and vitamins': 'bg-yellow-100 border-yellow-300',
      'Glycan metabolism': 'bg-pink-100 border-pink-300',
      'Biosynthesis of terpenoids and polyketides':
        'bg-indigo-100 border-indigo-300',
      'Biosynthesis of other secondary metabolites':
        'bg-teal-100 border-teal-300',
      'Xenobiotics biodegradation': 'bg-amber-100 border-amber-300',
    };
    return colorMap[metabolismType] || 'bg-gray-100 border-gray-300';
  };

  // Render loading state
  if (isLoading && koPathwayData.length === 0) {
    return (
      <div className="vf-stack vf-stack--400 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h1 className="vf-text vf-text--heading-l text-center mb-6">
          KEGG Orthology Pathway Analysis
        </h1>

        {/* File stats */}
        <div className="mb-4 text-sm text-gray-600 text-center">
          <p>
            Using BGZip indexed access ({fileStats.totalBlocks} blocks,{' '}
            {(fileStats.totalSize / (1024 * 1024)).toFixed(2)} MB)
            {fileStats.totalRecords &&
              ` - Approximately ${fileStats.totalRecords} records`}
          </p>
        </div>

        {/* Pagination controls */}
        <div className="flex justify-center mb-6">
          <nav
            className="inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoading}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">First</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className={`relative inline-flex items-center px-2 py-2 border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <span className="relative inline-flex items-center px-4 py-2 border bg-white text-sm font-medium">
              Page {currentPage} of {totalPages}
              {isLoading && (
                <span className="ml-2 inline-block w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></span>
              )}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className={`relative inline-flex items-center px-2 py-2 border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">Last</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M11.293 14.707a1 1 0 010-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </span>
                <div>
                  <h3 className="vf-card__heading text-lg">
                    <span className="vf-card__link text-2xl">
                      {totalPathways}
                    </span>
                  </h3>
                  <p className="vf-card__text text-sm">
                    Pathways (Current Page)
                  </p>
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
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                </span>
                <div>
                  <h3 className="vf-card__heading text-lg">
                    <span className="vf-card__link text-2xl">
                      {totalMatchingKOs}
                    </span>
                  </h3>
                  <p className="vf-card__text text-sm">Matching KOs</p>
                </div>
              </div>
            </div>
          </article>

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
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                </span>
                <div>
                  <h3 className="vf-card__heading text-lg">
                    <span className="vf-card__link text-2xl">
                      {completePathways}
                    </span>
                  </h3>
                  <p className="vf-card__text text-sm">Complete Pathways</p>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Pathway Categories */}
        <details className="vf-details mb-6">
          <summary className="vf-details--summary bg-gray-100 hover:bg-gray-200 transition-colors">
            <span className="font-medium">Pathway Categories Overview</span>
          </summary>
          <div className="p-4 bg-white rounded-b-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {Object.entries(groupedData).map(([metabolismType, pathways]) => {
                const colorClass = getMetabolismColor(metabolismType);
                return (
                  <article
                    className={`vf-card vf-card--bordered rounded-lg shadow-sm border-l-4 ${colorClass}`}
                    key={metabolismType}
                  >
                    <div className="vf-card__content | vf-stack vf-stack--200 p-4">
                      <h3 className="vf-card__heading text-lg">
                        {metabolismType}
                      </h3>
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (pathways.length / totalPathways) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-3 whitespace-nowrap text-sm">
                          <strong>{pathways.length}</strong> pathways
                        </span>
                      </div>
                      <ul className="vf-list text-sm">
                        {pathways.slice(0, 3).map((pathway) => (
                          <li
                            key={pathway.classId}
                            className="vf-list__item py-1 border-b border-gray-100 last:border-b-0"
                          >
                            <a
                              href={`#${pathway.classId}`}
                              className="vf-link flex items-center"
                            >
                              <span className="font-medium">
                                {pathway.classId}
                              </span>
                              <span className="mx-1">:</span>
                              <span className="truncate">{pathway.name}</span>
                            </a>
                          </li>
                        ))}
                        {pathways.length > 3 && (
                          <li className="vf-list__item py-1 text-right">
                            <span className="text-gray-500 text-xs">
                              + {pathways.length - 3} more
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </details>

        {/* Pathway Modules Table */}
        <DetailedVisualisationCard>
          <div className="vf-card__content | vf-stack vf-stack--400">
            <div className="border-b pb-3 mb-4">
              <h2 className="vf-card__heading">KEGG Pathway Modules</h2>
              <p className="vf-card__subheading text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="vf-table w-full">
                <thead className="vf-table__header bg-gray-50">
                  <tr className="vf-table__row">
                    <th className="vf-table__heading">Class ID</th>
                    <th className="vf-table__heading">Name</th>
                    <th className="vf-table__heading">Description</th>
                    <th className="vf-table__heading text-center">
                      Completeness
                    </th>
                    <th className="vf-table__heading text-center">
                      Matching KOs
                    </th>
                    <th className="vf-table__heading text-center">
                      Missing KOs
                    </th>
                  </tr>
                </thead>
                <tbody className="vf-table__body">
                  {koPathwayData.map((pathway) => {
                    const metabolismType =
                      pathway.description.split(';')[1]?.trim() ||
                      'Other metabolism';
                    const rowColorClass = metabolismType.includes(
                      'Carbohydrate'
                    )
                      ? 'hover:bg-blue-50'
                      : metabolismType.includes('Amino acid')
                      ? 'hover:bg-green-50'
                      : metabolismType.includes('Nucleotide')
                      ? 'hover:bg-purple-50'
                      : metabolismType.includes('Lipid')
                      ? 'hover:bg-orange-50'
                      : metabolismType.includes('Energy')
                      ? 'hover:bg-red-50'
                      : metabolismType.includes('Metabolism of cofactors')
                      ? 'hover:bg-yellow-50'
                      : 'hover:bg-gray-50';

                    const matchingKOCount = pathway.matchingKO
                      ? pathway.matchingKO.split(',').filter((k) => k).length
                      : 0;
                    const missingKOCount = pathway.missingKOs
                      ? pathway.missingKOs.split(',').filter((k) => k).length
                      : 0;

                    return (
                      <tr
                        className={`vf-table__row ${rowColorClass}`}
                        key={pathway.classId}
                        id={pathway.classId}
                      >
                        <td className="vf-table__cell font-medium text-blue-600">
                          <a
                            href={`https://www.genome.jp/kegg-bin/show_module?${pathway.classId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="vf-link"
                          >
                            {pathway.classId}
                          </a>
                        </td>
                        <td className="vf-table__cell">{pathway.name}</td>
                        <td className="vf-table__cell text-sm">
                          {pathway.description}
                        </td>
                        <td className="vf-table__cell text-center">
                          <div className="inline-flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`${
                                  pathway.completeness === 100
                                    ? 'bg-green-600'
                                    : pathway.completeness >= 75
                                    ? 'bg-green-500'
                                    : pathway.completeness >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                } h-2 rounded-full`}
                                style={{ width: `${pathway.completeness}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm">
                              {pathway.completeness.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="vf-table__cell text-center font-medium">
                          <div className="group relative">
                            {matchingKOCount}
                            {matchingKOCount > 0 &&
                              pathway.matchingKO.length > 15 && (
                                <div className="hidden group-hover:block absolute z-10 bg-gray-800 text-white text-xs p-2 rounded w-56 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-normal break-all">
                                  {pathway.matchingKO}
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="vf-table__cell text-center text-gray-500">
                          <div className="group relative">
                            {missingKOCount}
                            {missingKOCount > 0 &&
                              pathway.missingKOs.length > 15 && (
                                <div className="hidden group-hover:block absolute z-10 bg-gray-800 text-white text-xs p-2 rounded w-56 top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-normal break-all">
                                  {pathway.missingKOs}
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {koPathwayData.length === 0 && (
                    <tr className="vf-table__row">
                      <td
                        colSpan={6}
                        className="vf-table__cell text-center py-8 text-gray-500"
                      >
                        No pathway data found for this page
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DetailedVisualisationCard>

        {/* Bottom pagination */}
        <div className="flex justify-center mt-6">
          <nav
            className="inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoading}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">First</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className={`relative inline-flex items-center px-2 py-2 border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <span className="relative inline-flex items-center px-4 py-2 border bg-white text-sm font-medium">
              Page {currentPage} of {totalPages}
              {isLoading && (
                <span className="ml-2 inline-block w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></span>
              )}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className={`relative inline-flex items-center px-2 py-2 border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
            >
              <span className="sr-only">Last</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M11.293 14.707a1 1 0 010-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default KOTab;
