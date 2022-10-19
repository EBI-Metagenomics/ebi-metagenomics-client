import React from 'react';
import Select from 'react-select';
import {
  COLOUR_ABSENCE,
  COLOUR_PRESENCE,
  getAntiSMASHColour,
  getCOGColour,
} from 'components/Analysis/ContigViewer/mgnifyColours';

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
    default:
      return null;
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
        options={[
          { label: 'COG category', value: 'cog' },
          { label: 'KEGG ortholog', value: 'kegg' },
          { label: 'Pfam family existence', value: 'pfam' },
          { label: 'InterPro existence', value: 'interpro' },
          { label: 'GO (gene ontology) existence', value: 'go' },
          { label: 'AntiSMASH cluster type', value: 'antismash' },
        ]}
      />
    </div>
  );
};
