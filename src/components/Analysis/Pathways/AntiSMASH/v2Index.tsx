import React, { useContext, useState } from 'react';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import useMGnifyData from 'hooks/data/useMGnifyData';
import { TAXONOMY_COLOURS } from 'utils/taxon';
import Loading from 'components/UI/Loading';
import ExtLink from 'components/UI/ExtLink';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';

// Define the interface for antiSMASH cluster data
interface AntiSmashCluster {
  classId: string;
  description: string;
  count: number;
}

const AntiSmashSubpage: React.FC = () => {
  const { overviewData: analysisData } = useContext(AnalysisContext);
  const [colorMap] = useState(new Map());
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  // Sample data from the image
  const antiSmashData: AntiSmashCluster[] = [
    {
      classId: 'terpene',
      description: 'Terpene',
      count: 62,
    },
    {
      classId: 'bacteriocin',
      description:
        'Bacteriocin or other unspecified ribosomally synthesised and post-translationally modified peptide product (RiPP) cluster',
      count: 11,
    },
    {
      classId: 'arylpolyene',
      description: 'Aryl polyene cluster',
      count: 3,
    },
    {
      classId: 't3pks',
      description: 'Type III PKS',
      count: 1,
    },
    {
      classId: 't1pks',
      description: 'Type I PKS (Polyketide synthase)',
      count: 1,
    },
    {
      classId: 'nrps',
      description: 'Non-ribosomal peptide synthetase cluster',
      count: 1,
    },
    {
      classId: 'lassopeptide',
      description: 'Lasso peptide cluster',
      count: 1,
    },
  ];

  // Calculate total count
  const totalCount = antiSmashData.reduce(
    (sum, cluster) => sum + cluster.count,
    0
  );

  // Get unique color for each cluster type
  const getClusterColor = (classId: string): string => {
    if (!colorMap.has(classId)) {
      const index = Array.from(colorMap.keys()).length;
      colorMap.set(classId, TAXONOMY_COLOURS[index % TAXONOMY_COLOURS.length]);
    }
    return colorMap.get(classId) || TAXONOMY_COLOURS[0];
  };

  return (
    <div className="vf-stack vf-stack--400">
      <h1 className="vf-text vf-text--heading-l">
        antiSMASH Secondary Metabolite Analysis
      </h1>

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
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path>
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
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
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
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </span>
              <div>
                <h3 className="vf-card__heading text-lg">
                  <span className="vf-card__link text-2xl">
                    {antiSmashData[0].count}
                  </span>
                </h3>
                <p className="vf-card__text text-sm">Terpene Clusters</p>
              </div>
            </div>
          </div>
        </article>
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
                ></div>
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
                        {((cluster.count / totalCount) * 100).toFixed(1)}%
                        <div className="w-16 inline-block ml-2 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${(cluster.count / totalCount) * 100}%`,
                              backgroundColor: getClusterColor(cluster.classId),
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
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
              </table>
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
