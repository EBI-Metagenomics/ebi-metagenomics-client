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
import igv from 'igv';

import ContigsTable from 'components/Analysis/ContigViewer/Table';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import ContigsQueryContext from 'components/Analysis/ContigViewer/ContigsQueryContext';
import { find } from 'lodash-es';
import GFFCompare from 'components/Analysis/ContigViewer/GFFCompare';
import ReactDOMServer from 'react-dom/server';
import GenomeBrowserPopup from 'components/Genomes/Browser/Popup';

type ContigProps = {
  contig: MGnifyDatum;
};

const Contig: React.FC<ContigProps> = ({ contig }) => {
  const accession = useURLAccession();
  const { config } = useContext(UserContext);
  const contigId = contig.attributes['contig-id'];
  const fastaURL = `${config.api}analyses/${contig.attributes.accession}/contigs/${contigId}`;

  const { data, loading, error } = useData(fastaURL, ResponseFormat.TXT);

  const antiSMASH = contig.attributes['has-antismash'];
  const displayName = contig.attributes['contig-name'];
  const [igvBrowser, setIgvBrowser] = useState(null);

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
            type: 'mgnify-annotation',
            format: 'gff3',
            url: `${config.api}analyses/${accession}/contigs/${contigId}/annotations`,
            displayMode: 'EXPANDED',
            label: 'Functional annotation',
            colorAttributes: [
              ['Default', ''],
              ['COG', 'COG'],
              ['GO', 'GO'],
              ['KEGG', 'KEGG'],
              ['Pfam', 'Pfam'],
              ['InterPro', 'InterPro'],
            ],
            colorBy: undefined,
            defaultColour: undefined,
            labelBy: undefined,
          },
        ],
        showLegend: true,
        legendParent: '#contig',
      };
      if (antiSMASH) {
        options.tracks.push({
          colorAttributes: [],
          name: undefined,
          type: 'mgnify-annotation',
          format: 'gff3',
          displayMode: 'EXPANDED',
          url: `${config.api}analyses/${accession}/contigs/${contigId}/annotations?antismash=True`,
          label: 'antiSMASH',
          colorBy: 'as_type',
          defaultColour: '#BEBEBE',
          labelBy: 'as_gene_clusters',
        });
      }

      if (node === null) return;
      igv.createBrowser(node, options).then((browser) => {
        browser.on('trackclick', (ignored, trackData) =>
          ReactDOMServer.renderToString(<GenomeBrowserPopup data={trackData} />)
        );
        setIgvBrowser(browser);
      });
    },
    [accession, antiSMASH, config.api, contigId, displayName, fastaURL]
  );

  if (loading) return <Loading size="small" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  return (
    <div id="contig">
      <div ref={igvContainer} />
      <GFFCompare
        handleGFFTrack={(track) => {
          if (igvBrowser.findTracks('name', track.name).length) {
            // Don't load same track. Can happen in spurious re-renders.
            return;
          }
          igvBrowser.loadTrack({
            name: track.name,
            type: 'annotation',
            url: `data:application/octet-stream;base64,${track.encodedGFF}`,
            format: 'gff3',
            filterTypes: [],
          });
        }}
      />
    </div>
  );
};

const ContigsViewer: React.FC = () => {
  const accession = useURLAccession();

  const [queryParameters, setQueryParameters] = useQueryParametersState({
    contigsPageCursor: '',
    selectedContig: '',
  });
  const { data, loading, error } = useMGnifyData(
    `analyses/${accession}/contigs`,
    { cursor: queryParameters.contigsPageCursor as string },
    {}
  );

  const context = useMemo(
    () => ({
      contigsQueryData: { data, loading, error },
      queryParameters,
      setQueryParameters,
    }),
    [data, error, loading, queryParameters, setQueryParameters]
  );

  const contig = useMemo(() => {
    let selectedContig;
    if (!data) return null;

    const selectedContigId =
      queryParameters.selectedContig ||
      data.data?.[0]?.attributes?.['contig-id'];

    if (selectedContigId) {
      selectedContig = find(data.data, (c: KeyValue) => {
        return c.attributes['contig-id'] === selectedContigId;
      });
      if (selectedContig) {
        return selectedContig;
      }
    }
    return null;
  }, [data, queryParameters]);

  useEffect(() => {
    // If a new contig is autoselected (e.g. page change), put it in URL
    if (
      contig &&
      contig.attributes['contig-id'] !== queryParameters.selectedContig
    ) {
      setQueryParameters({
        ...queryParameters,
        selectedContig: contig.attributes['contig-id'],
      });
    }
  });

  useEffect(() => {
    // If the contig in URL isnt in the data-page, remove the bad ID from URL
    if (queryParameters.selectedContig && data && !contig) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { selectedContig: notInPageContigId, ...otherQueryParams } =
        queryParameters;
      setQueryParameters(otherQueryParams);
    }
  }, [data, contig, queryParameters, setQueryParameters]);

  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data || !contig) return <Loading />;
  // const isAssembly = analysisData.attributes['experiment-type'] === 'assembly';
  // const unit = isAssembly ? 'contig' : 'read';
  // const units = isAssembly ? 'contigs' : 'reads';
  return (
    <div className="vf-stack vf-stack--800">
      <ContigsQueryContext.Provider value={context}>
        <section>
          <div className="vf-stack">
            <details open>
              <summary>
                <b>Contig browser</b>
              </summary>
              <Contig contig={contig} />
            </details>
          </div>
        </section>
        <section>
          <ContigsTable />
        </section>
      </ContigsQueryContext.Provider>
    </div>
  );
};

export default ContigsViewer;
