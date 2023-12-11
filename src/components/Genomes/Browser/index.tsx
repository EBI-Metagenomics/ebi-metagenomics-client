import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import ReactDOMServer from 'react-dom/server';
import igv from 'igv/dist/igv.esm';

import UserContext from 'pages/Login/UserContext';
import useURLAccession from 'hooks/useURLAccession';
import Loading from 'components/UI/Loading';
import {
  AnnotationTrackColorPicker,
  annotationTrackCustomisations,
  FORMAT,
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

  const resolveQueryParameters = (browser, optionTrackName) => {
    const currentUrl = new URL(window.location.href);
    const featureId = currentUrl.searchParams.get('feature-id');
    const contigId = currentUrl.searchParams.get('contig-id');
    const selectedTrackColor = currentUrl.searchParams.get(
      'functional-annotation'
    );
    if (featureId) {
      browser.search(featureId);
    }
    if (contigId) {
      browser.search(contigId);
    }
    if (selectedTrackColor) {
      const trackColorBy = {
        label: selectedTrackColor,
        value: selectedTrackColor,
      };
      setTrackColorBys({
        ...trackColorBys,
        [optionTrackName]: trackColorBy,
      });
    }
  };

  const updateQueryParams = (key, value) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set(key, value);
    const updatedUrl = currentUrl.toString();
    window.history.replaceState(null, null, updatedUrl);
  };

  const handleColorChange = (option, action, trackId) => {
    if (action.action === 'select-option') {
      setTrackColorBys({
        ...trackColorBys,
        [trackId]: option,
      });
    }
    updateQueryParams('functional-annotation', option.value);
  };

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
            height: 120,
            url: `${config.api}genomes/${accession}/downloads/${accession}.gff`,
            displayMode: 'EXPANDED',
            label: 'Functional annotation',
            searchable: true,
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
            height: 120,
            url: virifyGffUrl,
            displayMode: 'EXPANDED',
            label: 'Viral annotation',
            searchable: true,
          });
        }
      });

      if (node === null) return;
      igv.createBrowser(node, options).then((browser) => {
        browser.on('trackclick', (track, trackData) =>
          ReactDOMServer.renderToString(<GenomeBrowserPopup data={trackData} />)
        );
        browser.on('locuschange', (referenceFrame) => {
          const { locusSearchString, start, end } = referenceFrame[0];
          updateQueryParams(
            'feature-id',
            `${locusSearchString}:${start}-${end}`
          );
        });
        setIgvBrowser(browser);
        setLoading(false);
        resolveQueryParameters(browser, options.tracks[0].name);
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
          ...annotationTrackCustomisations(colorBy.value, FORMAT.GENOME),
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
                handleColorChange(option, action, trackId);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GenomeBrowser;
