import React, { useMemo } from 'react';

import useURLAccession from 'hooks/useURLAccession';
import './style.css';
import useAnalysisDetail from 'hooks/data/useAnalysisDetail';
import '@fontsource/roboto';

import { JBrowseLinearGenomeView } from '@jbrowse/react-linear-genome-view2';
import { find } from 'lodash-es';
import Loading from 'components/UI/Loading';
import CompressedTSVTable from 'components/UI/CompressedTSVTable';
import DetailedVisualisationCard from '../VisualisationCards/DetailedVisualisationCard';
import { RouteTabs } from 'components/UI/Tabs';
import { Navigate, Route, Routes } from 'react-router-dom';
import ContigSearch from 'components/Analysis/ContigViewer/ContigSearch';
import {
  LGVProvider,
  useLGV,
} from 'components/Analysis/ContigViewer/V2ContigViewContext';

const ContigBrowser: React.FC = () => {
  const { viewState } = useLGV();
  if (!viewState) return <Loading size="small" />;
  return (
    <div className="vf-stack vf-stack--400">
      <JBrowseLinearGenomeView viewState={viewState} />
    </div>
  );
};

const ContigsViewer: React.FC = () => {
  console.log('Rendering ContigsViewer');
  const accession = useURLAccession();
  const { data, loading, error } = useAnalysisDetail(accession);

  const fasta = useMemo(() => {
    if (!data) return null;
    return find(
      data.downloads,
      (d) => d.file_type === 'fasta' && d.download_group === 'quality_control'
    );
  }, [data]);

  const gff = useMemo(() => {
    console.debug('Finding GFF URL...');
    if (!data) return null;
    return find(
      data.downloads,
      (d) => d.file_type === 'gff' && d.download_group === 'annotation_summary'
    );
  }, [data]);

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
            <LGVProvider fasta={fasta} gff={gff}>
              <ContigBrowser />
              <ContigSearch
                gffDownload={gff}
                fastaDownload={fasta}
                assemblyAccession={accession}
              />
            </LGVProvider>
          }
        />
      </Routes>
    </div>
  );

  // const [contigsPageCursorParam] = useQueryParamState(
  //   'contigs_page_cursor',
  //   ''
  // );
  // const [selectedContigParam, setSelectedContigParam] = useQueryParamState(
  //   'selected_contig',
  //   ''
  // );
  // useQueryParamState('gff_comparison_id', '');
  // const [contigLengthParam] = useQueryParamState('contig_length', '');
  // const [cogCategorySearchParam] = useQueryParamState(
  //   'cog_category_search',
  //   ''
  // );
  // const [keggOrthologSearchParam] = useQueryParamState(
  //   'kegg_ortholog_search',
  //   ''
  // );
  // const [goTermSearchParam] = useQueryParamState('go_term_search', '');
  // const [pfamSearchParam] = useQueryParamState('pfam_search', '');
  // const [interproSearchParam] = useQueryParamState('interpro_search', '');
  // const [antismashSearchParam] = useQueryParamState('antismash_search', '');
  // const [annotationTypeParam] = useQueryParamState('annotation_type', '');
  // const [contigsSearchParam] = useQueryParamState('contigs_search', '');
  //
  // const lengthRange = useMemo(() => {
  //   return (contigLengthParam as string).split(',').filter(Boolean).map(Number);
  // }, [contigLengthParam]);
  //
  // const { data, loading, error } = useMGnifyData(
  //   `analyses/${accession}/contigs`,
  //   {
  //     cursor: contigsPageCursorParam,
  //     search: contigsSearchParam,
  //     gt: lengthRange[0],
  //     lt: lengthRange[1],
  //     cog: cogCategorySearchParam,
  //     kegg: keggOrthologSearchParam,
  //     go: goTermSearchParam,
  //     pfam: pfamSearchParam,
  //     interpro: interproSearchParam,
  //     antismash: antismashSearchParam,
  //     'facet[]': annotationTypeParam,
  //   },
  //   {}
  // );
  //
  // const context = useMemo(
  //   () => ({
  //     contigsQueryData: { data, loading, error },
  //   }),
  //   [data, error, loading]
  // );
  //
  // const contig = useMemo(() => {
  //   let selectedContig;
  //   if (!data) return null;
  //
  //   const selectedContigId =
  //     selectedContigParam || data.data?.[0]?.attributes?.['contig-id'];
  //
  //   if (selectedContigId) {
  //     selectedContig = find(data.data, (c: KeyValue) => {
  //       return c.attributes['contig-id'] === selectedContigId;
  //     });
  //     if (selectedContig) {
  //       return selectedContig;
  //     }
  //   }
  //   return null;
  // }, [data, selectedContigParam]);
  //
  // useEffect(() => {
  //   // If a new contig is autoselected (e.g. page change), put it in URL
  //   if (contig && contig.attributes['contig-id'] !== selectedContigParam) {
  //     setSelectedContigParam(contig.attributes['contig-id']);
  //   }
  // });
  //
  // useEffect(() => {
  //   // If the contig in URL isnt in the data-page, remove the bad ID from URL
  //   if (setSelectedContigParam && data && !contig) {
  //     setSelectedContigParam('');
  //   }
  // }, [data, contig, setSelectedContigParam]);

  // const showContigOrLoader = () => {
  //   if (!contig && !loading) return <p>No contig found</p>;
  //   if (loading) return <Loading size="small" />;
  //   if (error) return <FetchError error={error} />;
  //   return <Contig contig={contig} />;
  // };
  //
  // if (error) return <FetchError error={error} />;
  // return (
  //   <div className="vf-stack vf-stack--800">
  //     <ContigsQueryContext.Provider value={context}>
  //       <section>
  //         <div className="vf-stack">
  //           <details open>
  //             <summary>
  //               <h4>Contig browser</h4>
  //             </summary>
  //             <div className="contig-igv-container">{showContigOrLoader()}</div>
  //           </details>
  //         </div>
  //       </section>
  //       <section className="vf-grid mg-contigs-list">
  //         <div className="vf-stack vf-stack--800">
  //           <ContigLengthFilter />
  //           <ContigTextFilter title="COG Category" placeholder="C" />
  //           <ContigTextFilter title="KEGG Ortholog" placeholder="K00161" />
  //           <ContigTextFilter title="GO Term" placeholder="GO:1901575" />
  //           <ContigTextFilter title="Pfam" placeholder="PF02086" />
  //           <ContigTextFilter title="InterPro" placeholder="IPR015200" />
  //           <ContigTextFilter title="antiSMASH" placeholder="terpene" />
  //           <ContigAnnotationTypeFilter />
  //         </div>
  //         <ContigsTable />
  //       </section>
  //     </ContigsQueryContext.Provider>
  //   </div>
  // );
};

export default ContigsViewer;
