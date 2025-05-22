import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';
import { BGZipService } from 'components/Analysis/BgZipService';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';

interface GOTerm {
  id: string;
  name: string;
  count: number;
  category: 'biological_process' | 'molecular_function' | 'cellular_component';
}

const GO: React.FC = () => {
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);
  const [bgzipService, setBgzipService] = useState<BGZipService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [activeCategory, setActiveCategory] =
    useState<string>('biological_process');
  const [goTermData, setGoTermData] = useState<GOTerm[]>([]);
  const [fileStats, setFileStats] = useState<{
    totalSize: number;
    totalBlocks: number;
    totalRecords: number | null;
  }>({
    totalSize: 0,
    totalBlocks: 0,
    totalRecords: null,
  });

  // Configuration
  const pageSize = 50;

  const dataFile = analysisOverviewData.downloads.find(
    (file) => file.alias.includes === 'go' && file.file_type === 'tsv.gz'
  );
  // const dataFileUrl = dataFile?.url;
  // const dataFileUrl =
  //   'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/go/ERZ1049444_go_summary.tsv.gz';

  const dataFileUrl =
    'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/interpro/ERZ1049444_interpro_summary.tsv.gz';

  // const dataFileUrl =
  //   'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/large_assem.tsv.gz';

  // const dataFileUrl =
  //   'http://localhost:8080/pub/databases/metagenomics/mgnify_results/PRJNA398/PRJNA398089/SRR1111/SRR1111111/V6/assembly/pathways-and-systems/kegg/ERZ1049444_summary_kegg_pathways.tsv.gz';

  const indexFileUrl = `${dataFileUrl}.gzi`;

  const parseGOTermData = useCallback((text: string): GOTerm[] => {
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) return [];

    let headerLine = lines[0];
    let dataLines = lines;

    const rawHeaderLine = headerLine.toLowerCase();

    if (
      !rawHeaderLine.includes('go') &&
      !rawHeaderLine.includes('term') &&
      !rawHeaderLine.includes('category') &&
      !rawHeaderLine.includes('count')

      // !rawHeaderLine.includes('go_id') &&
      // !rawHeaderLine.includes('go_name') &&
      // !rawHeaderLine.includes('count') &&
      // !rawHeaderLine.includes('category')
    ) {
      // headerLine = 'go_id\tgo_name\tcount\tcategory';
      headerLine = 'go\tterm\tcategory\tcount';
    } else {
      dataLines = lines.slice(1);
    }

    const headers = headerLine.split('\t');

    const colIndices = {
      go: headers.findIndex((h) => h.includes('go')),
      term: headers.findIndex((h) => h.includes('term')),
      category: headers.findIndex((h) => h.includes('category')),
      count: headers.findIndex((h) => h.includes('count')),

      // go_id: headers.findIndex((h) => h.includes('go_id')),
      // go_name: headers.findIndex((h) => h.includes('go_name')),
      // count: headers.findIndex((h) => h.includes('count')),
      // category: headers.findIndex((h) => h.includes('category')),
    };

    // if (colIndices.go_id === -1) colIndices.go_id = 0;
    if (colIndices.go === -1) colIndices.go = 0;
    if (colIndices.term === -1) colIndices.term = 1;
    if (colIndices.category === -1) colIndices.category = 3;
    if (colIndices.count === -1) colIndices.count = 2;

    // if (colIndices.go_id === -1) colIndices.go_id = 0;
    // if (colIndices.go_name === -1) colIndices.go_name = 1;
    // if (colIndices.count === -1) colIndices.count = 2;
    // if (colIndices.category === -1) colIndices.category = 3;

    return dataLines
      .map((line) => {
        const values = line.split('\t');
        if (values.length < 4) return null; // Skip malformed lines

        const category = values[colIndices.category].trim().toLowerCase();
        let categoryType:
          | 'biological_process'
          | 'molecular_function'
          | 'cellular_component';

        if (category.includes('biological') || category.includes('process')) {
          categoryType = 'biological_process';
        } else if (
          category.includes('molecular') ||
          category.includes('function')
        ) {
          categoryType = 'molecular_function';
        } else {
          categoryType = 'cellular_component';
        }

        return {
          id: values[colIndices.go] || '',
          name: values[colIndices.term] || '',
          category: categoryType,
          count: parseInt(values[colIndices.count] || '0', 10),
        };

        // return {
        //   id: values[colIndices.go_id] || '',
        //   name: values[colIndices.go_name] || '',
        //
        //   count: parseInt(values[colIndices.count] || '0', 10),
        //   category: categoryType,
        // };
      })
      .filter(Boolean) as GOTerm[];
  }, []);

  const loadPage = useCallback(
    async (page: number) => {
      if (!bgzipService) return;
      try {
        setIsLoading(true);
        const rawData = await bgzipService.getPageData(page, pageSize);
        const allGoTerms = parseGOTermData(rawData);

        // const filteredTerms = allGoTerms.filter(
        //   (term) => term.category === activeCategory
        // );

        setGoTermData(allGoTerms);
        setCurrentPage(page);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    },
    [bgzipService, parseGOTermData, activeCategory]
  );

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isLoading) return;
    loadPage(newPage);
  };

  // Handle category changes
  const handleCategoryChange = (category: string) => {
    setActiveCategory(
      category as
        | 'biological_process'
        | 'molecular_function'
        | 'cellular_component'
    );
    // Reset to page 1 when changing categories
    loadPage(1);
  };

  // Initialize BGZip service
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

  // Initialize service and load data
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
  }, [bgzipService, loadPage]);

  const calculateCategoryStats = () => {
    if (goTermData.length === 0) {
      return { uniqueTerms: 0, totalAnnotations: 0 };
    }

    const uniqueTerms = goTermData.length;
    const totalAnnotations = goTermData.reduce(
      (sum, term) => sum + term.count,
      0
    );

    return { uniqueTerms, totalAnnotations };
  };

  const stats = calculateCategoryStats();

  if (isLoading && goTermData.length === 0) {
    return (
      <div className="vf-stack vf-stack--400 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          <p className="mt-2">Loading GO term data...</p>
          <p className="text-sm text-gray-500 mt-1">
            Accessing data using BGZip index
          </p>
        </div>
      </div>
    );
  }

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
    <div>
      {/* Category selector tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            type="submit"
            className={`px-4 py-2 font-medium ${
              activeCategory === 'biological_process'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleCategoryChange('biological_process')}
          >
            Biological Process
          </button>
          <button
            type="submit"
            className={`px-4 py-2 font-medium ${
              activeCategory === 'molecular_function'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleCategoryChange('molecular_function')}
          >
            Molecular Function
          </button>
          <button
            type="submit"
            className={`px-4 py-2 font-medium ${
              activeCategory === 'cellular_component'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleCategoryChange('cellular_component')}
          >
            Cellular Component
          </button>
        </div>
      </div>

      <DetailedVisualisationCard>
        <div className="vf-card__content | vf-stack vf-stack--400">
          <h3 className="vf-card__heading">
            GO {/* eslint-disable-next-line no-nested-ternary */}
            {activeCategory === 'biological_process'
              ? 'Biological Process'
              : activeCategory === 'molecular_function'
              ? 'Molecular Function'
              : 'Cellular Component'}
          </h3>
          <p className="vf-card__subheading">
            Functional annotations related to {activeCategory.replace('_', ' ')}
          </p>

          <div className="mb-4 text-sm text-gray-600 text-center">
            <p>
              Using BGZip indexed access ({fileStats.totalBlocks} blocks,{' '}
              {(fileStats.totalSize / (1024 * 1024)).toFixed(2)} MB)
              {fileStats.totalRecords &&
                ` - Approximately ${fileStats.totalRecords} records`}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 my-4">
            {/* Summary Cards */}
            <article className="vf-card vf-card--brand vf-card--bordered">
              <div className="vf-card__content | vf-stack vf-stack--400">
                <h3 className="vf-card__heading">
                  <span className="vf-card__link">
                    {stats.uniqueTerms.toLocaleString()}
                  </span>
                </h3>
                <p className="vf-card__text">Unique GO terms identified</p>
              </div>
            </article>

            <article className="vf-card vf-card--bordered">
              <div className="vf-card__content | vf-stack vf-stack--400">
                <h3 className="vf-card__heading">
                  <span className="vf-card__link">
                    {stats.totalAnnotations.toLocaleString()}
                  </span>
                </h3>
                <p className="vf-card__text">Total GO annotations</p>
              </div>
            </article>
          </div>

          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="vf-table w-full">
                <thead className="vf-table__header">
                  <tr className="vf-table__row">
                    <th className="vf-table__heading">GO ID</th>
                    <th className="vf-table__heading">GO Term</th>
                    <th className="vf-table__heading text-right">
                      Annotations
                    </th>
                  </tr>
                </thead>
                <tbody className="vf-table__body">
                  {goTermData.map((term) => (
                    <tr className="vf-table__row hover:bg-gray-50">
                      <td className="vf-table__cell">
                        <a
                          href={`http://amigo.geneontology.org/amigo/term/${term.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {term.id}
                        </a>
                      </td>
                      <td className="vf-table__cell">{term.name}</td>
                      <td className="vf-table__cell text-right">
                        {term.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {goTermData.length === 0 && (
                    <tr className="vf-table__row">
                      <td
                        colSpan={3}
                        className="vf-table__cell text-center py-8 text-gray-500"
                      >
                        No GO terms found for this category
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination controls */}
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
          </div>

          {/* Page status information */}
          <div className="text-sm text-gray-500 mt-2 text-center">
            Showing page {currentPage} of {totalPages} (
            {isLoading ? 'Loading...' : `${goTermData.length} records`})
          </div>

          {/* Legend */}
          <div className="bg-gray-50 p-4 mt-4 border-t border-gray-200">
            <h3 className="font-medium mb-2 text-sm">Legend:</h3>
            <div className="text-sm text-gray-600">
              <p>
                <strong>GO ID:</strong> Gene Ontology term identifier
              </p>
              <p>
                <strong>GO Term:</strong> Description of the Gene Ontology term
              </p>
              <p>
                <strong>Annotations:</strong> Number of annotations for this GO
                term in the dataset
              </p>
            </div>
          </div>
        </div>
      </DetailedVisualisationCard>
    </div>
  );
};

export default GO;
