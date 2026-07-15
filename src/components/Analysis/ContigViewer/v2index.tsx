import React, { useMemo } from 'react';

import useURLAccession from 'hooks/useURLAccession';
import './style.css';
import useAnalysisDetail from 'hooks/data/useAnalysisDetail';
import '@fontsource/roboto';

import { find, includes } from 'lodash-es';
import Loading from 'components/UI/Loading';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import DetailedVisualisationCard from '../VisualisationCards/DetailedVisualisationCard';
import { RouteTabs } from 'components/UI/Tabs';
import { Navigate, Route, Routes } from 'react-router-dom';
import ContigSearch from 'components/Analysis/ContigViewer/ContigSearch';
import { LGVProvider } from 'components/Analysis/ContigViewer/V2ContigViewContext';
import ContigBrowser from 'components/ContigViewer/ContigBrowser';
import AdditionalGffNotice from 'components/ContigViewer/AdditionalGffNotice';

const ContigsViewer: React.FC = () => {
  const accession = useURLAccession();
  const { data, loading, error } = useAnalysisDetail(accession);
  const availableDownloads = useMemo(
    () => data?.downloads ?? [],
    [data?.downloads]
  );

  const fasta = useMemo(() => {
    if (!availableDownloads.length) return null;
    return find(
      availableDownloads,
      (d) => d.file_type === 'fasta' && d.download_group === 'quality_control'
    );
  }, [availableDownloads]);

  const gff = useMemo(() => {
    if (!availableDownloads.length) return null;
    return find(
      availableDownloads,
      (d) => d.file_type === 'gff' && d.download_group === 'annotation_summary'
    );
  }, [availableDownloads]);

  const gffColumns = useMemo(
    () => [
      {
        Header: 'contig-id',
        accessor: (row) => row[0],
        id: 'contig-id',
      },
      {
        Header: 'source',
        accessor: (row) => row[1],
        id: 'source',
      },
      {
        Header: 'feature',
        accessor: (row) => row[2],
        id: 'feature',
      },
      {
        Header: 'start',
        accessor: (row) => row[3],
        id: 'start',
      },
      {
        Header: 'end',
        accessor: (row) => row[4],
        id: 'end',
      },
      {
        Header: 'score',
        accessor: (row) => row[5],
        id: 'score',
      },
      {
        Header: 'strand',
        accessor: (row) => row[6],
        id: 'strand',
      },
      {
        Header: 'frame',
        accessor: (row) => row[7],
        id: 'frame',
      },
      {
        Header: 'attributes',
        accessor: (row) => row[8],
        id: 'attributes',
        Cell: ({ value }) => {
          if (!value) return null;
          return (
            <div className="vf-stack vf-stack--200 gff-attributes">
              {value.split(';').map((attr, i) => (
                <div key={i} className="gff-attribute">
                  {attr.trim()}
                </div>
              ))}
            </div>
          );
        },
      },
    ],
    []
  );

  const additionalGffs = useMemo(() => {
    if (!availableDownloads.length) return [];
    return availableDownloads.filter(
      (d) =>
        d.file_type === 'gff' &&
        includes(['mobilome_annotation_pipeline'], d.download_group)
    );
  }, [availableDownloads]);

  if (loading || !accession) return <Loading size="small" />;
  if (error) return <p>Error loading analysis</p>;
  if (!fasta) return <p>No contigs fasta file available</p>;
  if (!gff) return <p>No annotations available</p>;

  const tabs = [
    { label: 'Preview GFF', to: 'gff-preview' },
    { label: 'Search contigs', to: 'search-contigs' },
  ];

  return (
    <div className="vf-stack vf-stack--400">
      <RouteTabs tabs={tabs} />
      <Routes>
        <Route index element={<Navigate to="gff-preview" replace />} />
        <Route
          path="gff-preview"
          element={
            <DetailedVisualisationCard ftpLink={gff.url} title={gff.alias}>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                  {gff.long_description}
                </p>
                <p className="text-sm">
                  Download this file to view the complete GFF of this analysis.
                </p>
              </div>
              <CompressedTSVTable download={gff} columns={gffColumns} />
            </DetailedVisualisationCard>
          }
        />
        <Route
          path="search-contigs"
          element={
            <LGVProvider
              fasta={fasta}
              gff={gff}
              additionalGffs={additionalGffs}
            >
              <ContigBrowser />
              <ContigSearch
                gffDownload={gff}
                fastaDownload={fasta}
                assemblyAccession={accession}
              />
              <AdditionalGffNotice additionalGffs={additionalGffs} />
            </LGVProvider>
          }
        />
      </Routes>
    </div>
  );
};

export default ContigsViewer;
