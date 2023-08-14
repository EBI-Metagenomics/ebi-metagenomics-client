/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo } from 'react';

import useURLAccession from 'hooks/useURLAccession';
import useMGnifyData from 'hooks/data/useMGnifyData';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useData, { KeyValue, MGnifyDatum } from 'hooks/data/useData';
import './style.css';

import ContigsTable from 'components/Analysis/ContigViewer/Table';
import ContigsQueryContext from 'components/Analysis/ContigViewer/ContigsQueryContext';
import { find } from 'lodash-es';
import ContigLengthFilter from 'components/Analysis/ContigViewer/Filter/ContigLength';
import ContigTextFilter from 'components/Analysis/ContigViewer/Filter/ContigText';
// eslint-disable-next-line max-len
import ContigAnnotationTypeFilter from 'components/Analysis/ContigViewer/Filter/ContigAnnotationType';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import Contig from 'components/Analysis/Contig';

type ContigProps = {
  contig: MGnifyDatum;
};

const ContigsViewer: React.FC = () => {
  const accession = useURLAccession();

  const [contigsPageCursorParam] = useQueryParamState(
    'contigs_page_cursor',
    ''
  );
  const [selectedContigParam, setSelectedContigParam] = useQueryParamState(
    'selected_contig',
    ''
  );
  useQueryParamState('gff_comparison_id', '');
  const [contigLengthParam] = useQueryParamState('contig_length', '');
  const [cogCategorySearchParam] = useQueryParamState(
    'cog_category_search',
    ''
  );
  const [keggOrthologSearchParam] = useQueryParamState(
    'kegg_ortholog_search',
    ''
  );
  const [goTermSearchParam] = useQueryParamState('go_term_search', '');
  const [pfamSearchParam] = useQueryParamState('pfam_search', '');
  const [interproSearchParam] = useQueryParamState('interpro_search', '');
  const [antismashSearchParam] = useQueryParamState('antismash_search', '');
  const [annotationTypeParam] = useQueryParamState('annotation_type', '');
  const [contigsSearchParam] = useQueryParamState('contigs_search', '');

  const lengthRange = useMemo(() => {
    return (contigLengthParam as string).split(',').filter(Boolean).map(Number);
  }, [contigLengthParam]);

  const { data, loading, error } = useMGnifyData(
    `analyses/${accession}/contigs`,
    {
      cursor: contigsPageCursorParam,
      search: contigsSearchParam,
      gt: lengthRange[0],
      lt: lengthRange[1],
      cog: cogCategorySearchParam,
      kegg: keggOrthologSearchParam,
      go: goTermSearchParam,
      pfam: pfamSearchParam,
      interpro: interproSearchParam,
      antismash: antismashSearchParam,
      'facet[]': annotationTypeParam,
    },
    {}
  );

  const context = useMemo(
    () => ({
      contigsQueryData: { data, loading, error },
    }),
    [data, error, loading]
  );

  const contig = useMemo(() => {
    let selectedContig;
    if (!data) return null;

    const selectedContigId =
      selectedContigParam || data.data?.[0]?.attributes?.['contig-id'];

    if (selectedContigId) {
      selectedContig = find(data.data, (c: KeyValue) => {
        return c.attributes['contig-id'] === selectedContigId;
      });
      if (selectedContig) {
        return selectedContig;
      }
    }
    return null;
  }, [data, selectedContigParam]);

  useEffect(() => {
    // If a new contig is autoselected (e.g. page change), put it in URL
    if (contig && contig.attributes['contig-id'] !== selectedContigParam) {
      setSelectedContigParam(contig.attributes['contig-id']);
    }
  });

  useEffect(() => {
    // If the contig in URL isnt in the data-page, remove the bad ID from URL
    if (setSelectedContigParam && data && !contig) {
      setSelectedContigParam('');
    }
  }, [data, contig, setSelectedContigParam]);

  if (error) return <FetchError error={error} />;
  return (
    <div className="vf-stack vf-stack--800">
      <ContigsQueryContext.Provider value={context}>
        <section>
          <div className="vf-stack">
            <details open>
              <summary>
                <h4>Contig browser</h4>
              </summary>
              <div className="contig-igv-container">
                {!!contig && <Contig contig={contig} />}
                {!contig && <Loading size="small" />}
              </div>
            </details>
          </div>
        </section>
        <section className="vf-grid mg-contigs-list">
          <div className="vf-stack vf-stack--800">
            <ContigLengthFilter />
            <ContigTextFilter title="COG Category" placeholder="C" />
            <ContigTextFilter title="KEGG Ortholog" placeholder="K00161" />
            <ContigTextFilter title="GO Term" placeholder="GO:1901575" />
            <ContigTextFilter title="Pfam" placeholder="PF02086" />
            <ContigTextFilter title="InterPro" placeholder="IPR015200" />
            <ContigTextFilter title="antiSMASH" placeholder="terpene" />
            <ContigAnnotationTypeFilter />
          </div>
          <ContigsTable />
        </section>
      </ContigsQueryContext.Provider>
    </div>
  );
};

export default ContigsViewer;
