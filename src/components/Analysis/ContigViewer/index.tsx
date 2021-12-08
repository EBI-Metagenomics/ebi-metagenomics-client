import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import useURLAccession from 'hooks/useURLAccession';
import useMGnifyData from 'hooks/data/useMGnifyData';
import Loading from 'components/UI/Loading';
import FetchError from 'components/UI/FetchError';
import useData, { MGnifyDatum, ResponseFormat } from 'hooks/data/useData';
import './style.css';
import UserContext from 'pages/Login/UserContext';
import igv from 'igv';

type ContigProps = {
  contig: MGnifyDatum;
};

const Contig: React.FC<ContigProps> = ({ contig }) => {
  const { config } = useContext(UserContext);
  const contigId = contig.attributes['contig-id'];
  const fastaURL = `${config.api}analyses/${contig.attributes.accession}/contigs/${contigId}`;

  const contigContainer = useRef();
  const { data, loading, error } = useData(fastaURL, ResponseFormat.TXT);

  const antiSMASH = contig.attributes['has-antismash'];
  const displayName = contig.attributes['contig-name'];

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
            url: `${config.api}analyses/${contig.attributes.accession}/contigs/${contigId}/annotations`,
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
          url: `${config.api}analyses/${contig.attributes.accession}/contigs/${contigId}/annotations?antismash=True`,
          label: 'antiSMASH',
          colorBy: 'as_type',
          defaultColour: '#BEBEBE',
          labelBy: 'as_gene_clusters',
        });
      }

      if (node === null) return;
      igv.createBrowser(node, options).then((browser) => {
        browser.on('trackclick', (ignored, trackData) => {
          console.log(trackData);
          // return igvPopup(data);
        });
      });
    },
    [contig]
  );

  if (loading) return <Loading size="small" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  return (
    <div id="contig">
      <div ref={igvContainer} />
    </div>
  );
};

type ContigsViewerProps = {
  analysisData: MGnifyDatum;
};

const ContigsViewer: React.FC<ContigsViewerProps> = ({ analysisData }) => {
  const accession = useURLAccession();

  const { data, loading, error } = useMGnifyData(
    `analyses/${accession}/contigs`,
    {},
    {}
  );
  if (loading) return <Loading size="large" />;
  if (error) return <FetchError error={error} />;
  if (!data) return <Loading />;

  // const isAssembly = analysisData.attributes['experiment-type'] === 'assembly';
  // const unit = isAssembly ? 'contig' : 'read';
  // const units = isAssembly ? 'contigs' : 'reads';
  return (
    <div className="vf-stack vf-stack--200">
      <section>
        <div className="vf-stack">
          <details open>
            <summary>
              <b>Contig browser</b>
            </summary>
            <Contig contig={data.data[0]} />
          </details>
        </div>
      </section>
    </div>
  );
};

export default ContigsViewer;
