import React, { useEffect, useState } from 'react';
import {
  AnnotationTrackColorPicker,
  annotationTrackCustomisations,
  FORMAT,
} from 'components/IGV/TrackColourPicker';
import { colorScale } from 'components/Analysis/ContigViewer/GFFCompare';

type TrackViewsProps = {
  // trackViews: Array<any>;
  igvBrowser: any;
};

const TrackViews: React.FC<TrackViewsProps> = ({ igvBrowser }) => {
  const [trackColorBys, setTrackColorBys] = useState({});
  const [updatingTracks, setUpdatingTracks] = useState(true);
  // console.log('trackColorBys', trackColorBys);
  // console.log('igvBrowser', igvBrowser);
  useEffect(() => {
    const updateTracks = async () => {
      // alert('updateTracks');
      setUpdatingTracks(true);
      const tracksToRemove = [];
      const tracksToAdd = [];
      igvBrowser?.trackViews?.forEach((trackView) => {
        if (trackView.track.type !== 'annotation') return;
        const colorBy = trackColorBys[trackView.track.id];
        if (colorBy) {
          // alert('colorBy');
          // console.log('colorBy', colorBy);
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
    // }, [trackColorBys, igvBrowser]);
  }, [trackColorBys]);

  if (updatingTracks) {
    return null;
  }

  return (
    <div className="vf-grid vf-grid__col-3">
      {igvBrowser?.trackViews?.map((trackView) => {
        const trackId = trackView.track.id;
        if (trackView.track.type !== 'annotation') return React.Fragment;
        const isMetaProteomics =
          trackView.track.config.label === 'Metaproteomics';

        // if (isMetaProteomics) {
        //   if (!trackColorBys?.[trackView.track.id]?.colorBarMax)
        //     return React.Fragment;
        //   return (
        //     <div key={trackView.track.id}>
        //       <p className="vf-text-body vf-text-body--2">
        //         {trackView.track.config.label} track colour
        //       </p>
        //
        //       <div className="colorBarWrapper">
        //         0
        //         <div className="colorBar" />
        //         {Math.round(trackColorBys[trackView.track.id].colorBarMax)}
        //       </div>
        //
        //       <p className="vf-text-body vf-text-body--4">
        //         Semiquantitative expression spectrum count — scaled against the
        //         maximum in this study.
        //       </p>
        //     </div>
        //   );
        // }
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
  );
};

export default TrackViews;
