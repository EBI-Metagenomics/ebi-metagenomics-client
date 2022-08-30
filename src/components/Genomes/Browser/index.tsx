import React, { useEffect, useRef, useState, useContext } from 'react';
import ReactDOMServer from 'react-dom/server';
import igv from 'igv';

import UserContext from 'pages/Login/UserContext';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import GenomeBrowserPopup from './Popup';

const GenomeBrowser: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const accession = useURLAccession();
  const { config } = useContext(UserContext);

  const tracks = [
    {
      type: 'annotation',
      // name: downloadsModel.get('name'),
      url: `${config.api}genomes/${accession}/downloads/${accession}.gff`,
      format: 'gff3',
      label: 'Functional annotation',
      // displayMode: 'EXPANDED',
      // colorAttributes: [
      //   ['Default', ''],
      //   ['COG', 'COG'],
      //   ['Product', 'product'],
      //   ['Pfam', 'Pfam'],
      //   ['KEGG', 'KEGG'],
      //   ['InterPro', 'InterPro'],
      //   ['eggNOG', 'eggNOG'],
      // ],
    },
  ];
  const options = {
    showChromosomeWidget: false,
    showTrackLabelButton: true,
    showTrackLabels: true,
    showCenterGuide: false,
    showAllChromosomes: true,
    reference: {
      fastaURL: `${config.api}genomes/${accession}/downloads/${accession}.fna`,
      indexURL: `${config.api}genomes/${accession}/downloads/${accession}.fna.fai`,
    },
    tracks,
    showLegend: true,
    legendParent: '#genome-browser',
  };
  const divRef = useRef(null);
  useEffect(() => {
    igv.createBrowser(divRef.current, options).then((browser) => {
      setLoading(false);
      browser.on('trackclick', (track, data) =>
        ReactDOMServer.renderToString(
          <GenomeBrowserPopup data={data} hasMetaProteomics={false} />
        )
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div id="genome-browser">
      {loading && <Loading size="large" />}
      <div className="genome-browser-container" ref={divRef} />
    </div>
  );
};

export default GenomeBrowser;
