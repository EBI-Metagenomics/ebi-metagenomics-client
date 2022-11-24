import React from 'react';
import Select from 'react-select';
import {
  COLOUR_ABSENCE,
  COLOUR_PRESENCE,
  getAntiSMASHColour,
  getCOGColour,
  getMiBIGColor,
} from 'components/Analysis/ContigViewer/mgnifyColours';
import ExtLink from 'components/UI/ExtLink';
import Tooltip from 'components/UI/Tooltip';

function maybeGetAttributeValue(feature, attrPossibleNames: string[]) {
  if (!feature || !feature.getAttributeValue) return null;
  // eslint-disable-next-line no-restricted-syntax
  for (const [, attr] of attrPossibleNames.entries()) {
    const featureAttrVal = feature.getAttributeValue(attr);
    if (featureAttrVal) {
      return featureAttrVal;
    }
  }
  return null;
}

export const annotationTrackCustomisations = (trackColorBy) => {
  switch (trackColorBy) {
    case 'cog':
      return {
        nameField: 'COG',
        color: (feature) => {
          const cog = maybeGetAttributeValue(feature, ['cog', 'COG']);
          return cog ? getCOGColour(cog) : '#ddd';
        },
      };
    case 'kegg':
      return {
        nameField: 'kegg',
        color: (feature) =>
          !maybeGetAttributeValue(feature, ['kegg', 'KEGG'])
            ? COLOUR_ABSENCE
            : COLOUR_PRESENCE,
      };
    case 'pfam':
      return {
        nameField: 'pfam',
        color: (feature) =>
          !maybeGetAttributeValue(feature, ['pfam', 'Pfam'])
            ? COLOUR_ABSENCE
            : COLOUR_PRESENCE,
      };
    case 'interpro':
      return {
        nameField: 'interpro',
        color: (feature) =>
          !maybeGetAttributeValue(feature, ['interpro', 'InterPro'])
            ? COLOUR_ABSENCE
            : COLOUR_PRESENCE,
      };
    case 'go':
      return {
        nameField: 'go',
        color: (feature) =>
          !maybeGetAttributeValue(feature, ['go', 'GO'])
            ? COLOUR_ABSENCE
            : COLOUR_PRESENCE,
      };
    case 'antismash':
      return {
        nameField: 'as_type',
        color: (feature) => {
          const as = maybeGetAttributeValue(feature, ['as_type']);
          return as ? getAntiSMASHColour(as) : '#ddd';
        },
      };
    case 'viphog':
      return {
        nameField: 'viphog',
        color: (feature) =>
          !maybeGetAttributeValue(feature, ['viphog', 'ViPhOG'])
            ? COLOUR_ABSENCE
            : COLOUR_PRESENCE,
      };
    case 'mibig':
      return {
        nameField: 'nearest_MiBIG_class',
        color: (feature) => {
          const mibigClass = maybeGetAttributeValue(feature, [
            'nearest_MiBIG_class',
            'nearest_mibig_class',
          ]);
          return mibigClass ? getMiBIGColor(mibigClass) : '#ddd';
        },
      };
    default:
      return null;
  }
};

const trackColorOptionsForType = (trackType) => {
  switch (trackType) {
    case 'SanntiS annotation':
      return [{ label: 'MiBIG class', value: 'mibig' }];
    case 'Viral annotation':
      return [{ label: 'ViPhOG existence', value: 'viphog' }];
    case 'antiSMASH':
      return [{ label: 'AntiSMASH cluster type', value: 'antismash' }];
    case 'Functional annotation':
    default:
      return [
        { label: 'AntiSMASH cluster type', value: 'antismash' },
        { label: 'COG category', value: 'cog' },
        { label: 'GO (gene ontology) existence', value: 'go' },
        { label: 'InterPro existence', value: 'interpro' },
        { label: 'KEGG ortholog', value: 'kegg' },
        { label: 'MiBIG class', value: 'mibig' },
        { label: 'Pfam family existence', value: 'pfam' },
        { label: 'ViPhOG existence', value: 'viphog' },
      ];
  }
};

type AnnotationTrackColorPickerProps = {
  trackView: any;
  trackColorBys: Record<string, { label: string; value: string }>;
  onChange: (event, action) => void;
};
export const AnnotationTrackColorPicker: React.FC<
  AnnotationTrackColorPickerProps
> = ({ trackView, trackColorBys, onChange }) => {
  return (
    <div className="vf-stack vf-stack--200">
      <label className="vf-form__label" htmlFor="biome-select">
        {trackView.track.config.label} track colour
      </label>
      <Select
        theme={(theme) => ({
          ...theme,
          borderRadius: 0,
          border: '2px solid grey',
        })}
        placeholder={`Colour ${trackView.track.id} by...`}
        value={trackColorBys[trackView.track.id]}
        onChange={onChange}
        name={`track-colour-${trackView.track.id}`}
        inputId={`track-colour-${trackView.track.id}`}
        options={trackColorOptionsForType(trackView.track.id)}
      />
      {trackView.track.id === 'SanntiS annotation' && (
        <span className="vf-text-body vf-text-body--4">
          <Tooltip content="This tool is not part of the standard MGnify pipeline.">
            <span>Extra annotation track</span>
          </Tooltip>{' '}
          provided by{' '}
          <ExtLink href="https://github.com/Finn-Lab/SanntiS">SanntiS</ExtLink>
        </span>
      )}
    </div>
  );
};
