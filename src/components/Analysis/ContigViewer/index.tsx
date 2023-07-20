/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import GFFCompare, {
  colorScale,
  getGFFHeaderValue,
} from 'components/Analysis/ContigViewer/GFFCompare';
import ReactDOMServer from 'react-dom/server';
import GenomeBrowserPopup from 'components/Genomes/Browser/Popup';
import ContigLengthFilter from 'components/Analysis/ContigViewer/Filter/ContigLength';
import ContigTextFilter from 'components/Analysis/ContigViewer/Filter/ContigText';
// eslint-disable-next-line max-len
import ContigAnnotationTypeFilter from 'components/Analysis/ContigViewer/Filter/ContigAnnotationType';
import LoadingOverlay from 'components/UI/LoadingOverlay';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import {
  AnnotationTrackColorPicker,
  annotationTrackCustomisations,
  FORMAT,
} from 'components/IGV/TrackColourPicker';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import roCrateSingleton from 'utils/roCrateSingleton';

type ContigProps = {
  contig: MGnifyDatum;
};

const Contig: React.FC<ContigProps> = ({ contig }) => {
  const accession = useURLAccession();
  const { config } = useContext(UserContext);
  const { overviewData: analysisOverviewData } = useContext(AnalysisContext);
  const hasMetaProteomics = config?.featureFlags?.contigIgvGffUploader;
  const contigId = contig.attributes['contig-id'];
  const fastaURL = `${config.api}analyses/${contig.attributes.accession}/contigs/${contigId}`;

  const { data, loading, error } = useData(fastaURL, ResponseFormat.TXT);

  const assemblyId = analysisOverviewData.relationships.assembly.data.id;

  const { data: extraAnnotations, loading: loadingExtraAnnotations } =
    useMGnifyData(`assemblies/${assemblyId}/extra-annotations`);

  const antiSMASH = contig.attributes['has-antismash'];
  const displayName = contig.attributes['contig-name'];
  const [igvBrowser, setIgvBrowser] = useState(null);

  const [trackColorBys, setTrackColorBys] = useState({});
  const [updatingTracks, setUpdatingTracks] = useState(true);

  const currentAnnotationUrl = useRef(null);

  async function buildTrackBasedOnAnnotationType(
    annotationType,
    annotationUrl
  ) {
    currentAnnotationUrl.current = annotationUrl;
    if (annotationType === 'Analysis RO Crate') {
      const trackProperties =
        roCrateSingleton.getTrackProperties(annotationUrl);
      return trackProperties || {};
    }
    return {
      name: annotationType,
      type: 'annotation',
      format: 'gff3',
      displayMode: 'EXPANDED',
      url: annotationUrl,
      label: annotationType,
      crate: null,
    };
  }

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
        ],
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
      if (extraAnnotations) {
        (extraAnnotations.data as MGnifyDatum[]).forEach((anno) => {
          const annotationType = (anno.attributes.description as KeyValue)
            .label as string;
          buildTrackBasedOnAnnotationType(
            annotationType,
            anno.links.self as string
          ).then((trackProperties) => {
            options.tracks.push(trackProperties);
          });
        });
      }

      if (node === null) return;
      igv.createBrowser(node, options).then((browser) => {
        browser.on('trackclick', (track, trackData) =>
          ReactDOMServer.renderToString(
            <GenomeBrowserPopup
              data={trackData}
              hasMetaProteomics={hasMetaProteomics}
            />
          )
        );
        browser.on('trackorderchanged', () => {
          browser.trackViews.forEach((trackView) => {
            if (
              trackView.track.type === 'annotation' &&
              trackView.track.config.label === 'Metaproteomics'
            ) {
              setTrackColorBys({
                ...trackColorBys,
                [trackView.track.id]: {
                  colorBarMax: parseFloat(
                    getGFFHeaderValue(
                      trackView.track.config.url.slice(37),
                      // = GFF data-url without the 'data:application/octet-stream;base64' (37 chars) prefix
                      'max_spectrum_count_value_in_study'
                    )
                  ),
                },
              });
            }
          });
        });
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
      extraAnnotations,
      hasMetaProteomics,
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
        if (trackView.track.config.label === 'Metaproteomics') {
          const cbMax = trackColorBys?.[trackView.track.id]?.colorBarMax;
          const newTrackConfig = {
            ...trackView.track.config,
            nameField: 'pride_id',
            color: cbMax
              ? (feature) => {
                  const colorBarNumber = parseFloat(
                    feature.getAttributeValue(
                      'semiquantitative_expression_spectrum_count'
                    )
                  );
                  return colorScale(colorBarNumber, cbMax);
                }
              : null,
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

  if (loading || loadingExtraAnnotations) return <Loading size="small" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;
  return (
    <div id="contig" className="vf-stack vf-stack--600">
      <div ref={igvContainer} />
      {updatingTracks && <Loading size="small" />}
      {!updatingTracks && (
        <div className="vf-grid vf-grid__col-3">
          {igvBrowser?.trackViews?.map((trackView) => {
            const trackId = trackView.track.id;
            if (trackView.track.type !== 'annotation') return React.Fragment;
            const isMetaProteomics =
              trackView.track.config.label === 'Metaproteomics';

            if (isMetaProteomics) {
              if (!trackColorBys?.[trackView.track.id]?.colorBarMax)
                return React.Fragment;
              return (
                <div key={trackView.track.id}>
                  <p className="vf-text-body vf-text-body--2">
                    {trackView.track.config.label} track colour
                  </p>

                  <div className="colorBarWrapper">
                    0
                    <div className="colorBar" />
                    {Math.round(trackColorBys[trackView.track.id].colorBarMax)}
                  </div>

                  <p className="vf-text-body vf-text-body--4">
                    Semiquantitative expression spectrum count — scaled against
                    the maximum in this study.
                  </p>
                </div>
              );
            }
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
        </div>
      )}
      {hasMetaProteomics && <GFFCompare igvBrowser={igvBrowser} />}
    </div>
  );
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
                <LoadingOverlay loading={loading}>
                  {!!contig && <Contig contig={contig} />}
                  {!contig && (
                    <div
                      className="vf-box vf-box-theme--primary vf-box--easy"
                      style={{
                        backgroundColor: '#d1e3f6',
                        margin: '8px auto',
                      }}
                    >
                      <h3 className="vf-box__heading">No contig selected</h3>
                      <p className="vf-box__text">
                        Select a contig from the table to load the interactive
                        annotation viewer
                      </p>
                    </div>
                  )}
                </LoadingOverlay>
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
