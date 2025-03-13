import React from 'react';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';

// Define pathway data interface
interface KOPathway {
  classId: string;
  name: string;
  description: string;
  completeness: number;
  matchingKO: number;
  missingKOs: number;
}

const KOTab: React.FC = () => {
  // Sample data from the image
  const koPathwayData: KOPathway[] = [
    {
      classId: 'M00003',
      name: 'Gluconeogenesis, oxaloacetate => fructose-6P',
      description:
        'Pathway modules; Carbohydrate metabolism; Central carbohydrate metabolism',
      completeness: 100,
      matchingKO: 10,
      missingKOs: 0,
    },
    {
      classId: 'M00005',
      name: 'PRPP biosynthesis, ribose 5P => PRPP',
      description:
        'Pathway modules; Carbohydrate metabolism; Central carbohydrate metabolism',
      completeness: 100,
      matchingKO: 1,
      missingKOs: 0,
    },
    {
      classId: 'M00010',
      name: 'Citrate cycle, first carbon oxidation, oxaloacetate => 2-oxoglutarate',
      description:
        'Pathway modules; Carbohydrate metabolism; Central carbohydrate metabolism',
      completeness: 100,
      matchingKO: 4,
      missingKOs: 0,
    },
    {
      classId: 'M00015',
      name: 'Proline biosynthesis, glutamate => proline',
      description:
        'Pathway modules; Amino acid metabolism; Arginine and proline metabolism',
      completeness: 100,
      matchingKO: 3,
      missingKOs: 0,
    },
    {
      classId: 'M00016',
      name: 'Lysine biosynthesis, succinyl-DAP pathway, aspartate => lysine',
      description: 'Pathway modules; Amino acid metabolism; Lysine metabolism',
      completeness: 100,
      matchingKO: 9,
      missingKOs: 0,
    },
  ];

  // Group data by metabolism type for summary
  interface GroupedPathways {
    [key: string]: KOPathway[];
  }

  const groupedData = koPathwayData.reduce<GroupedPathways>((acc, pathway) => {
    const metabolismType = pathway.description.split(';')[1].trim();
    if (!acc[metabolismType]) {
      acc[metabolismType] = [];
    }
    acc[metabolismType].push(pathway);
    return acc;
  }, {});

  // Calculate summary statistics
  const totalPathways = koPathwayData.length;
  const totalMatchingKOs = koPathwayData.reduce(
    (sum, pathway) => sum + pathway.matchingKO,
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
    };
    return colorMap[metabolismType] || 'bg-gray-100 border-gray-300';
  };

  return (
    <div className="vf-stack vf-stack--400">
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h1 className="vf-text vf-text--heading-l text-center mb-6">
          KEGG Orthology Pathway Analysis
        </h1>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {/* Summary Cards with improved design */}
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
                  <p className="vf-card__text text-sm">Total Pathways</p>
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
                  <p className="vf-card__text text-sm">Total Matching KOs</p>
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

        <details className="vf-details">
          <summary className="vf-details--summary bg-gray-100 hover:bg-gray-200 transition-colors">
            <span className="font-medium">Pathway Modules Detailed Table</span>
          </summary>
          <DetailedVisualisationCard>
            <div className="vf-card__content | vf-stack vf-stack--400">
              <div className="border-b pb-3 mb-4">
                <h2 className="vf-card__heading">KEGG Pathway Modules</h2>
                <p className="vf-card__subheading text-gray-600">
                  Complete analysis of KEGG Orthology pathways
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
                        Matching KO
                      </th>
                      <th className="vf-table__heading text-center">
                        Missing KOs
                      </th>
                    </tr>
                  </thead>
                  <tbody className="vf-table__body">
                    {koPathwayData.map((pathway) => {
                      const metabolismType = pathway.description
                        .split(';')[1]
                        .trim();
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
                        : 'hover:bg-gray-50';

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
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${pathway.completeness}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm">
                                {pathway.completeness}%
                              </span>
                            </div>
                          </td>
                          <td className="vf-table__cell text-center font-medium">
                            {pathway.matchingKO}
                          </td>
                          <td className="vf-table__cell text-center text-gray-500">
                            {pathway.missingKOs}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </DetailedVisualisationCard>
        </details>
      </div>
    </div>
  );
};

export default KOTab;
