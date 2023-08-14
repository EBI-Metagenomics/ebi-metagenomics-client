import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useData, {
  KeyValue,
  MGnifyDatum,
  ResponseFormat,
} from 'hooks/data/useData';
import useURLAccession from 'hooks/useURLAccession';
import UserContext from 'pages/Login/UserContext';
import AnalysisContext from 'pages/Analysis/AnalysisContext';
import useMGnifyData from 'hooks/data/useMGnifyData';
import roCrateSingleton from 'utils/roCrateSingleton';
import igv from 'igv/dist/igv.esm';
import ReactDOMServer from 'react-dom/server';
import GenomeBrowserPopup from 'components/Genomes/Browser/Popup';
import GFFCompare, {
  colorScale,
  getGFFHeaderValue,
} from 'components/Analysis/ContigViewer/GFFCompare';
import {
  AnnotationTrackColorPicker,
  annotationTrackCustomisations,
  FORMAT,
} from 'components/IGV/TrackColourPicker';
import FetchError from 'components/UI/FetchError';
import Loading from 'components/UI/Loading';
import TrackViews from 'components/Analysis/TrackViews';

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

  // const [trackColorBys, setTrackColorBys] = useState({});
  // const [updatingTracks, setUpdatingTracks] = useState(true);

  const currentAnnotationUrl = useRef(null);

  async function buildTrackBasedOnAnnotationType(
    annotationType,
    annotationUrl
  ) {
    currentAnnotationUrl.current = annotationUrl;
    if (annotationType === 'Analysis RO Crate') {
      const trackProperties = await roCrateSingleton.getTrackProperties(
        annotationUrl
      );
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
      // alert('called back');
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
          // alert('trackorderchanged');
          browser.trackViews.forEach((trackView) => {
            if (
              trackView.track.type === 'annotation' &&
              trackView.track.config.label === 'Metaproteomics'
            ) {
              alert('setting colors from here');
              // setTrackColorBys({
              //   ...trackColorBys,
              //   [trackView.track.id]: {
              //     colorBarMax: parseFloat(
              //       getGFFHeaderValue(
              //         trackView.track.config.url.slice(37),
              //         // = GFF data-url without the 'data:application/octet-stream;base64' (37 chars) prefix
              //         'max_spectrum_count_value_in_study'
              //       )
              //     ),
              //   },
              // });
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

  if (loading || loadingExtraAnnotations) return null;
  if (error) return <FetchError error={error} />;
  if (!data) return null;
  return (
    <div id="contig" className="vf-stack vf-stack--600">
      <div ref={igvContainer} />
      {/* {!updatingTracks && <TrackViews trackViews={igvBrowser.trackViews} />} */}
      <TrackViews igvBrowser={igvBrowser} />
      {hasMetaProteomics && <GFFCompare igvBrowser={igvBrowser} />}
    </div>
  );
};

export default Contig;
