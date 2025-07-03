import React from 'react';
import { ExternalLink } from 'lucide-react';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';

const PfamTab = () => {
  // KOAM data from the image
  const pfamData = [
    { id: 'KO00005', description: 'ABC transporter', count: 9539 },
    { id: 'KO00106', description: 'short chain dehydrogenase', count: 4339 },
    {
      id: 'KO00171',
      description: 'Aldehyde dehydrogenase family',
      count: 3759,
    },
    {
      id: 'KO00528',
      description:
        'Binding-protein-dependent transport system inner membrane component',
      count: 3666,
    },
    {
      id: 'KO01370',
      description: 'NAD dependent epimerase/dehydratase family',
      count: 3410,
    },
    { id: 'KO00501', description: 'AMP-binding enzyme', count: 3407 },
    { id: 'KO00884', description: 'Sulfatase', count: 3017 },
    { id: 'KO00892', description: 'EamA-like transporter family', count: 2956 },
    {
      id: 'KO13561',
      description: 'Enoyl-(Acyl carrier protein) reductase',
      count: 2915,
    },
    { id: 'KO00593', description: 'TonB dependent receptor', count: 2721 },
    {
      id: 'KO00133',
      description: 'tRNA synthetases class I (I, L, M and V)',
      count: 2356,
    },
    {
      id: 'KO00132',
      description: 'Bacterial transferase hexapeptide (six repeats)',
      count: 2344,
    },
    {
      id: 'KO00155',
      description: 'Aminotransferase class I and II',
      count: 2286,
    },
    { id: 'KO16363', description: 'GDP-mannose 4,6 dehydratase', count: 2280 },
    {
      id: 'KO01041',
      description: 'DegT/DnrJ/EryC1/StrS aminotransferase family',
      count: 2182,
    },
    {
      id: 'KO00378',
      description: 'Enoyl-CoA hydratase/isomerase',
      count: 1951,
    },
    {
      id: 'KO00535',
      description: 'Glycosyl transferase family 2',
      count: 1924,
    },
    { id: 'KO00873', description: 'AcrB/AcrD/AcrF family', count: 1920 },
  ];

  const totalCount = pfamData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div>
      <details className="vf-details" open>
        <summary className="vf-details--summary">KO Summary</summary>
        <DetailedVisualisationCard>
          <div className="vf-card__content | vf-stack vf-stack--400">
            <h3 className="vf-card__heading">KO Summary</h3>
            <p className="vf-card__subheading">Lorem Ipsum Delorim</p>
            <p className="vf-card__text">
              <div className="flex flex-wrap gap-4 my-4">
                {/* Summary Cards */}
                <article className="vf-card vf-card--brand vf-card--bordered">
                  <div className="vf-card__content | vf-stack vf-stack--400">
                    <h3 className="vf-card__heading">
                      <span className="vf-card__link">
                        {pfamData.length.toLocaleString()}
                      </span>
                    </h3>
                    <p className="vf-card__text">
                      Unique KO entries identified
                    </p>
                  </div>
                </article>

                <article className="vf-card vf-card--bordered">
                  <div className="vf-card__content | vf-stack vf-stack--400">
                    <h3 className="vf-card__heading">
                      <span className="vf-card__link">
                        {totalCount.toLocaleString()}
                      </span>
                    </h3>
                    <p className="vf-card__text">Total KO entries</p>
                  </div>
                </article>
              </div>

              <div className="mt-4">
                <div className="overflow-x-auto">
                  <table className="vf-table w-full">
                    <thead className="vf-table__header">
                      <tr className="vf-table__row">
                        <th className="vf-table__heading">Class ID</th>
                        <th className="vf-table__heading">Description</th>
                        <th className="vf-table__heading text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody className="vf-table__body">
                      {pfamData.map((pfam) => (
                        <tr
                          className="vf-table__row hover:bg-gray-50"
                          key={pfam.id}
                        >
                          <td className="vf-table__cell font-medium text-blue-600">
                            <a
                              href={`https://www.ebi.ac.uk/interpro/entry/pfam/${pfam.id}`}
                              className="hover:underline flex items-center"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {pfam.id}
                              <ExternalLink
                                size={14}
                                className="ml-1 opacity-70"
                              />
                            </a>
                          </td>
                          <td className="vf-table__cell">{pfam.description}</td>
                          <td className="vf-table__cell text-right">
                            {pfam.count.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 p-4 mt-4 border-t border-gray-200">
                <h3 className="font-medium mb-2 text-sm">Legend:</h3>
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Class ID:</strong> KO identifier (linked to KEGG)
                  </p>
                  <p>
                    <strong>Description:</strong> Functional description of the
                    entry
                  </p>
                  <p>
                    <strong>Count:</strong> Number of occurrences of this entry
                  </p>
                </div>
              </div>
            </p>
          </div>
        </DetailedVisualisationCard>
      </details>
    </div>
  );
};

export default PfamTab;
