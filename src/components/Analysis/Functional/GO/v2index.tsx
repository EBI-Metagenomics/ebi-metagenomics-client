import React, { useContext, useEffect, useState } from 'react';
import TabsForQueryParameter from 'components/UI/TabsForQueryParameter';
import AnalysisContext from 'pages/Analysis/V2AnalysisContext';
import useMGnifyData from 'hooks/data/useMGnifyData';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import { MGnifyDatum } from 'hooks/data/useData';
import { TAXONOMY_COLOURS } from 'utils/taxon';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import GOBarChart from './BarChart';
import GOPieChart from './PieChart';
import DetailedVisualisationCard from 'components/Analysis/VisualisationCards/DetailedVisualisationCard';

const GO: React.FC = () => {
  const biologicalProcessData = {
    'small molecule metabolic process': 60000,
    'nitrogen compound metabolic process': 55000,
    'biosynthetic process': 47000,
    transport: 40000,
    translation: 32000,
    'RNA metabolic process': 25000,
    'metabolic process': 22000,
    'DNA metabolic process': 20000,
    'carbohydrate metabolic process': 18000,
    'lipid metabolic process': 15000,
  };

  const molecularFunctionData = {
    'nucleotide binding': 100000,
    'oxidoreductase activity': 75000,
    'transferase activity': 65000,
    'catalytic activity': 60000,
    'nucleic acid binding': 50000,
    'transporter activity': 48000,
    'hydrolase activity': 40000,
    'ligase activity': 30000,
    'protein binding': 25000,
    'coenzyme binding': 22000,
  };

  const cellularComponentData = {
    membrane: 40000,
    'intrinsic to membrane': 30000,
    ribosome: 28000,
    cytoplasm: 25000,
    'plasma membrane': 12000,
    'outer membrane': 5000,
    intracellular: 5000,
    'extracellular region': 4000,
    chromosome: 3000,
    'bacterial type flagellum': 2500,
  };
  return (
    <div>
      <details className="vf-details">
        <summary className="vf-details--summary">Biological Process</summary>
        <DetailedVisualisationCard>
          <div className="vf-card__content | vf-stack vf-stack--400">
            <h3 className="vf-card__heading">GO Biological Process</h3>
            <p className="vf-card__subheading">
              Functional annotations related to biological processes
            </p>
            <p className="vf-card__text">
              <div className="flex flex-wrap gap-4 my-4">
                {/* Summary Cards */}
                <article className="vf-card vf-card--brand vf-card--bordered">
                  <div className="vf-card__content | vf-stack vf-stack--400">
                    <h3 className="vf-card__heading">
                      <span className="vf-card__link">
                        {Object.keys(
                          biologicalProcessData
                        ).length.toLocaleString()}
                      </span>
                    </h3>
                    <p className="vf-card__text">Unique GO terms identified</p>
                  </div>
                </article>

                <article className="vf-card vf-card--bordered">
                  <div className="vf-card__content | vf-stack vf-stack--400">
                    <h3 className="vf-card__heading">
                      <span className="vf-card__link">
                        {Object.values(biologicalProcessData)
                          .reduce((sum, item) => sum + item, 0)
                          .toLocaleString()}
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
                        <th className="vf-table__heading">GO Term</th>
                        <th className="vf-table__heading text-right">
                          Annotations
                        </th>
                      </tr>
                    </thead>
                    <tbody className="vf-table__body">
                      {Object.entries(biologicalProcessData).map(
                        ([id, count]) => (
                          <tr
                            className="vf-table__row hover:bg-gray-50"
                            key={id}
                          >
                            <td className="vf-table__cell">{id}</td>
                            <td className="vf-table__cell text-right">
                              {count.toLocaleString()}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </p>
          </div>
        </DetailedVisualisationCard>
      </details>

      <details className="vf-details">
        <summary className="vf-details--summary">Molecular Function</summary>
        <DetailedVisualisationCard>
          <div className="vf-card__content | vf-stack vf-stack--400">
            <h3 className="vf-card__heading">GO Molecular Function</h3>
            <p className="vf-card__subheading">
              Functional annotations related to molecular activities
            </p>
            <p className="vf-card__text">
              <div className="flex flex-wrap gap-4 my-4">
                {/* Summary Cards */}
                <article className="vf-card vf-card--brand vf-card--bordered">
                  <div className="vf-card__content | vf-stack vf-stack--400">
                    <h3 className="vf-card__heading">
                      <span className="vf-card__link">
                        {Object.keys(
                          molecularFunctionData
                        ).length.toLocaleString()}
                      </span>
                    </h3>
                    <p className="vf-card__text">Unique GO terms identified</p>
                  </div>
                </article>

                <article className="vf-card vf-card--bordered">
                  <div className="vf-card__content | vf-stack vf-stack--400">
                    <h3 className="vf-card__heading">
                      <span className="vf-card__link">
                        {Object.values(molecularFunctionData)
                          .reduce((sum, item) => sum + item, 0)
                          .toLocaleString()}
                      </span>
                    </h3>
                    <p className="vf-card__text">Total GO annotations</p>
                  </div>
                </article>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                <div className="overflow-x-auto">
                  <table className="vf-table w-full">
                    <thead className="vf-table__header">
                      <tr className="vf-table__row">
                        <th className="vf-table__heading">GO Term</th>
                        <th className="vf-table__heading text-right">
                          Annotations
                        </th>
                      </tr>
                    </thead>
                    <tbody className="vf-table__body">
                      {Object.entries(molecularFunctionData).map(
                        ([id, count]) => (
                          <tr
                            className="vf-table__row hover:bg-gray-50"
                            key={id}
                          >
                            <td className="vf-table__cell">{id}</td>
                            <td className="vf-table__cell text-right">
                              {count.toLocaleString()}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </p>
          </div>
        </DetailedVisualisationCard>
      </details>

      <details className="vf-details">
        <summary className="vf-details--summary">Cellular Component</summary>
        <DetailedVisualisationCard>
          <div className="vf-card__content | vf-stack vf-stack--400">
            <h3 className="vf-card__heading">GO Cellular Component</h3>
            <p className="vf-card__subheading">
              Functional annotations related to cellular locations
            </p>
            <p className="vf-card__text">
              <div className="flex flex-wrap gap-4 my-4">
                {/* Summary Cards */}
                <article className="vf-card vf-card--brand vf-card--bordered">
                  <div className="vf-card__content | vf-stack vf-stack--400">
                    <h3 className="vf-card__heading">
                      <span className="vf-card__link">
                        {Object.keys(
                          cellularComponentData
                        ).length.toLocaleString()}
                      </span>
                    </h3>
                    <p className="vf-card__text">Unique GO terms identified</p>
                  </div>
                </article>

                <article className="vf-card vf-card--bordered">
                  <div className="vf-card__content | vf-stack vf-stack--400">
                    <h3 className="vf-card__heading">
                      <span className="vf-card__link">
                        {Object.values(cellularComponentData)
                          .reduce((sum, item) => sum + item, 0)
                          .toLocaleString()}
                      </span>
                    </h3>
                    <p className="vf-card__text">Total GO annotations</p>
                  </div>
                </article>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                <div className="overflow-x-auto">
                  <table className="vf-table w-full">
                    <thead className="vf-table__header">
                      <tr className="vf-table__row">
                        <th className="vf-table__heading">GO Term</th>
                        <th className="vf-table__heading text-right">
                          Annotations
                        </th>
                      </tr>
                    </thead>
                    <tbody className="vf-table__body">
                      {Object.entries(cellularComponentData).map(
                        ([id, count]) => (
                          <tr
                            className="vf-table__row hover:bg-gray-50"
                            key={id}
                          >
                            <td className="vf-table__cell">{id}</td>
                            <td className="vf-table__cell text-right">
                              {count.toLocaleString()}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </p>
          </div>
        </DetailedVisualisationCard>
      </details>
    </div>
  );
};

export default GO;
