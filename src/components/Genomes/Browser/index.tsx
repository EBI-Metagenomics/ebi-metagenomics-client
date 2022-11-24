import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import ReactDOMServer from 'react-dom/server';
import igv from 'igv';

import UserContext from 'pages/Login/UserContext';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import {
  AnnotationTrackColorPicker,
  annotationTrackCustomisations,
} from 'components/IGV/TrackColourPicker';
import GenomeBrowserPopup from './Popup';

const GenomeBrowser: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const accession = useURLAccession();
  const { config } = useContext(UserContext);
  const [igvBrowser, setIgvBrowser] = useState(null);
  const [trackColorBys, setTrackColorBys] = useState({});

  const virifyGffUrl = `${config.api}genomes/${accession}/downloads/${accession}_virify.gff`;

  const hasVirify = useMemo(async () => {
    const response = await fetch(virifyGffUrl, { method: 'HEAD' });
    return response.ok;
  }, [virifyGffUrl]);

  const igvContainer = useCallback(
    async (node) => {
      const options = {
        showChromosomeWidget: true,
        showTrackLabelButton: true,
        showTrackLabels: true,
        showCenterGuide: false,
        reference: {
          indexURL: `${config.api}genomes/${accession}/downloads/${accession}.fna.fai`,
          fastaURL: `${config.api}genomes/${accession}/downloads/${accession}.fna`,
        },
        tracks: [
          {
            name: 'Functional annotation',
            type: 'annotation',
            format: 'gff3',
            url: `${config.api}genomes/${accession}/downloads/${accession}.gff`,
            displayMode: 'EXPANDED',
            label: 'Functional annotation',
          },
        ],
        showLegend: true,
        legendParent: '#contig',
      };

      hasVirify.then((has) => {
        if (has) {
          options.tracks.push({
            name: 'Viral annotation',
            type: 'annotation',
            format: 'gff3',
            url: virifyGffUrl,
            displayMode: 'EXPANDED',
            label: 'Viral annotation',
          });
        }
      });

      if (node === null) return;
      igv.createBrowser(node, options).then((browser) => {
        browser.on('trackclick', (track, trackData) =>
          ReactDOMServer.renderToString(
            <GenomeBrowserPopup data={trackData} hasMetaProteomics={false} />
          )
        );

        setIgvBrowser(browser);
        setLoading(false);
      });
    },
    [config.api, accession, hasVirify, virifyGffUrl]
  );

  useEffect(() => {
    const tracksToRemove = [];
    const tracksToAdd = [];
    igvBrowser?.trackViews?.forEach((trackView) => {
      if (trackView.track.type !== 'annotation') return;
      const colorBy = trackColorBys[trackView.track.id];
      if (colorBy) {
        const newTrackConfig = {
          ...trackView.track.config,
          ...annotationTrackCustomisations(colorBy.value),
        };
        if (newTrackConfig.nameField !== trackView.track.config.nameField) {
          // Prevent unnecessary track reloads
          tracksToRemove.push(trackView.track.id);
          tracksToAdd.push(newTrackConfig);
        }
      }
    });
    tracksToRemove.forEach((track) => igvBrowser.removeTrackByName(track));
    tracksToAdd.forEach((track) => igvBrowser.loadTrack(track));
  }, [trackColorBys, igvBrowser]);

  return (
    <div id="genome-browser">
      {loading && <Loading size="large" />}
      <div className="genome-browser-container" ref={igvContainer} />
      <div className="vf-grid vf-grid__col-3">
        {igvBrowser?.trackViews?.map((trackView) => {
          const trackId = trackView.track.id;
          if (trackView.track.type !== 'annotation') return React.Fragment;
          return (
            <AnnotationTrackColorPicker
              key={trackView.track.id}
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
    </div>
  );
};

export default GenomeBrowser;
