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
import ContigLengthFilter from 'components/Analysis/ContigViewer/Filter/ContigLength';
import ContigTextFilter from 'components/Analysis/ContigViewer/Filter/ContigText';
// eslint-disable-next-line max-len
import ContigAnnotationTypeFilter from 'components/Analysis/ContigViewer/Filter/ContigAnnotationType';
import LoadingOverlay from 'components/UI/LoadingOverlay';

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
    [fastaURL, displayName, config.api, accession, contigId, antiSMASH]
  );

  if (loading) return <Loading size="small" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  return (
    <div id="contig">
      <div ref={igvContainer} />
      {config?.featureFlags?.contigIgvGffUploader && (
        <GFFCompare igvBrowser={igvBrowser} />
      )}
    </div>
  );
};

const ContigsViewer: React.FC = () => {
  const accession = useURLAccession();

  const [queryParameters, setQueryParameters] = useQueryParametersState({
    contigs_page_cursor: '',
    selected_contig: '',
    gff_comparison_id: '',
    contig_length: '',
    cog_category_search: '',
    kegg_ortholog_search: '',
    go_term_search: '',
    pfam_search: '',
    interpro_search: '',
    antismash_search: '',
    annotation_type: '',
    contigs_search: '',
  });
  const lengthRange = useMemo(() => {
    return (queryParameters.contig_length as string)
      .split(',')
      .filter(Boolean)
      .map(Number);
  }, [queryParameters.contig_length]);

  const { data, loading, error } = useMGnifyData(
    `analyses/${accession}/contigs`,
    {
      cursor: queryParameters.contigs_page_cursor as string,
      search: queryParameters.contigs_search as string,
      gt: lengthRange[0],
      lt: lengthRange[1],
      cog: queryParameters.cog_category_search as string,
      kegg: queryParameters.kegg_ortholog_search as string,
      go: queryParameters.go_term_search as string,
      pfam: queryParameters.pfam_search as string,
      interpro: queryParameters.interpro_search as string,
      antismash: queryParameters.antismash_search as string,
      'facet[]': queryParameters.annotation_type as string,
    },
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
      queryParameters.selected_contig ||
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
      contig.attributes['contig-id'] !== queryParameters.selected_contig
    ) {
      setQueryParameters({
        ...queryParameters,
        selectedContig: contig.attributes['contig-id'],
      });
    }
  });

  useEffect(() => {
    // If the contig in URL isnt in the data-page, remove the bad ID from URL
    if (queryParameters.selected_contig && data && !contig) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { selected_contig: notInPageContigId, ...otherQueryParams } =
        queryParameters;
      setQueryParameters(otherQueryParams);
    }
  }, [data, contig, queryParameters, setQueryParameters]);

  if (error) return <FetchError error={error} />;
  return (
    <div className="vf-stack vf-stack--800">
      <ContigsQueryContext.Provider value={context}>
        <section>
          <div className="vf-stack">
            <details open>
              <summary>
                <b>Contig browser</b>
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
