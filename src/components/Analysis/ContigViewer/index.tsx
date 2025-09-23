import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import useURLAccession from 'hooks/useURLAccession';
import useMGnifyData from 'hooks/data/useMGnifyData';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useData, {
  KeyValue,
  MGnifyDatum,
  ResponseFormat,
} from 'hooks/data/useData';
import './style.css';
import UserContext from 'pages/Login/UserContext';
import igv from 'igv/dist/igv.esm';

import ContigsTable from 'components/Analysis/ContigViewer/Table';
import ContigsQueryContext from 'components/Analysis/ContigViewer/ContigsQueryContext';
import { find } from 'lodash-es';
import ReactDOMServer from 'react-dom/server';
import GenomeBrowserPopup from 'components/Genomes/Browser/Popup';
import ContigLengthFilter from 'components/Analysis/ContigViewer/Filter/ContigLength';
import ContigTextFilter from 'components/Analysis/ContigViewer/Filter/ContigText';

import ContigAnnotationTypeFilter from 'components/Analysis/ContigViewer/Filter/ContigAnnotationType';
import { createSharedQueryParamContext } from 'hooks/queryParamState/useQueryParamState';
import {
  AnnotationTrackColorPicker,
  annotationTrackCustomisations,
  FORMAT,
} from 'components/IGV/TrackColourPicker';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import {
  useCrates,
  useOfflineCrate,
} from 'hooks/genomeViewer/CrateStore/useCrates';
import { Track } from 'utils/trackView';
import ROCrateComparer from 'components/UI/ROCrateComparer';
import {
  SharedMultipleValueQueryParam,
  SharedNumberRangeQueryParam,
  SharedTextQueryParam,
} from 'hooks/queryParamState/QueryParamStore/QueryParamContext';

type ContigProps = {
  contig: MGnifyDatum;
};

const Contig: React.FC<ContigProps> = ({ contig }) => {
  const accession = useURLAccession();
  const { config } = useContext(UserContext);
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);
  const contigId = contig.attributes['contig-id'];
  const fastaURL = `${config.api}analyses/${contig.attributes.accession}/contigs/${contigId}`;

  const { data, loading, error } = useData(fastaURL, ResponseFormat.TXT);

  const assemblyId = analysisOverviewData.relationships.assembly.data.id;

  const { crates, loading: loadingCrates } = useCrates(
    `assemblies/${assemblyId}/extra-annotations`
  );

  const { crate: offlineCrate } = useOfflineCrate();

  const antiSMASH = contig.attributes['has-antismash'];
  const displayName = contig.attributes['contig-name'];
  const [igvBrowser, setIgvBrowser] = useState(null);

  const [trackColorBys, setTrackColorBys] = useState({});
  const [updatingTracks, setUpdatingTracks] = useState(true);

  const igvContainer = useCallback(
    (node) => {
      const options = {
        showChromosomeWidget: false,
        showTrackLabelButton: true,
        showTrackLabels: true,
        showCenterGuide: false,
        reference: {
          indexed: false,
          fastaURL,
        },
        tracks: [
          {
            name: displayName,
            type: 'annotation',
            format: 'gff3',
            url: `${config.api}analyses/${accession}/contigs/${contigId}/annotations`,
            displayMode: 'EXPANDED',
            label: 'Functional annotation',
            crate: null,
          },
        ] as Track[],
        showLegend: true,
        legendParent: '#contig',
      };
      if (antiSMASH) {
        options.tracks.push({
          name: 'antiSMASH',
          type: 'annotation',
          format: 'gff3',
          displayMode: 'EXPANDED',
          url: `${config.api}analyses/${accession}/contigs/${contigId}/annotations?antismash=True`,
          label: 'antiSMASH',
          crate: null,
        });
      }
      if (crates) {
        crates.forEach((crate) => {
          options.tracks.push(crate.track);
        });
      }
      if (offlineCrate) {
        options.tracks.push(offlineCrate.track);
      }

      if (node === null) return;
      igv.createBrowser(node, options).then((browser) => {
        browser.on('trackclick', (track, trackData) =>
          ReactDOMServer.renderToString(<GenomeBrowserPopup data={trackData} />)
        );
        setIgvBrowser(browser);
      });
    },
    [
      fastaURL,
      displayName,
      config.api,
      accession,
      contigId,
      antiSMASH,
      crates,
      offlineCrate,
    ]
  );

  useEffect(() => {
    const updateTracks = async () => {
      setUpdatingTracks(true);
      const tracksToRemove = [];
      const tracksToAdd = [];
      igvBrowser?.trackViews?.forEach((trackView) => {
        if (trackView.track.type !== 'annotation') return;
        const colorBy = trackColorBys[trackView.track.id];
        if (colorBy) {
          const newTrackConfig = {
            ...trackView.track.config,
            ...annotationTrackCustomisations(colorBy.value, FORMAT.ASSEMBLY_V5),
          };
          if (newTrackConfig.nameField !== trackView.track.config.nameField) {
            // Prevent unnecessary track reloads
            tracksToRemove.push(trackView.track.id);
            tracksToAdd.push(newTrackConfig);
          }
        }
      });
      await Promise.all(
        tracksToRemove.map(async (track) => igvBrowser.removeTrackByName(track))
      );
      await Promise.all(
        tracksToAdd.map(async (track) => igvBrowser.loadTrack(track))
      );
      return igvBrowser?.trackViews;
    };
    updateTracks().then(() => setUpdatingTracks(false));
  }, [trackColorBys, igvBrowser]);

  if (loading || loadingCrates) return null;
  if (error) return <FetchError error={error} />;
  if (!data) return null;
  return (
    <div id="contig" className="vf-stack vf-stack--600">
      <div ref={igvContainer} />
      {updatingTracks && <Loading size="small" />}
      {!updatingTracks && (
        <div className="vf-grid vf-grid__col-3">
          {igvBrowser?.trackViews?.map((trackView) => {
            const trackId = trackView.track.id;
            if (trackView.track.type !== 'annotation') return React.Fragment;

            return (
              <AnnotationTrackColorPicker
                key={trackId}
                trackView={trackView}
                trackColorBys={trackColorBys}
                onChange={(option, action) => {
                  if (action.action === 'select-option') {
                    setTrackColorBys({
                      ...trackColorBys,
                      [trackId]: option,
                    });
                  }
                }}
              />
            );
          })}
          <ROCrateComparer />
        </div>
      )}
    </div>
  );
};

const {
  useContigsPageCursor,
  useSelectedContig,
  useContigLength,
  useCogCategorySearch,
  useKeggOrthologSearch,
  useGoTermSearch,
  usePfamSearch,
  useInterproSearch,
  useAntismashSearch,
  useAnnotationType,
  useContigsSearch,
  withQueryParamProvider,
} = createSharedQueryParamContext({
  contigsPageCursor: SharedTextQueryParam(''),
  selectedContig: SharedTextQueryParam(''),
  gffComparisonId: SharedTextQueryParam(''),
  contigLength: SharedNumberRangeQueryParam([500, 10e6]),
  cogCategorySearch: SharedTextQueryParam(''),
  keggOrthologSearch: SharedTextQueryParam(''),
  goTermSearch: SharedTextQueryParam(''),
  pfamSearch: SharedTextQueryParam(''),
  interproSearch: SharedTextQueryParam(''),
  antismashSearch: SharedTextQueryParam(''),
  annotationType: SharedMultipleValueQueryParam([]),
  contigsSearch: SharedTextQueryParam(''),
});

const ContigsViewer: React.FC = () => {
  const accession = useURLAccession();

  const [contigsPageCursorParam] = useContigsPageCursor<string>();
  const [selectedContigParam, setSelectedContigParam] =
    useSelectedContig<string>();
  const [lengthRange] = useContigLength<[number, number]>();
  const [cogCategorySearchParam] = useCogCategorySearch<string>();
  const [keggOrthologSearchParam] = useKeggOrthologSearch<string>();
  const [goTermSearchParam] = useGoTermSearch<string>();
  const [pfamSearchParam] = usePfamSearch<string>();
  const [interproSearchParam] = useInterproSearch<string>();
  const [antismashSearchParam] = useAntismashSearch<string>();
  const [annotationTypeParam] = useAnnotationType<string[]>();
  const [contigsSearchParam] = useContigsSearch<string>();

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
      'facet[]': annotationTypeParam.join(','),
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

  const showContigOrLoader = () => {
    if (!contig && !loading) return <p>No contig found</p>;
    if (loading) return <Loading size="small" />;
    if (error) return <FetchError error={error} />;
    return <Contig contig={contig} />;
  };

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
              <div className="contig-igv-container">{showContigOrLoader()}</div>
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

export default withQueryParamProvider(ContigsViewer);
