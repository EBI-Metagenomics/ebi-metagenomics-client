import React from 'react';
import Select from 'react-select';
import {
  COLOUR_ABSENCE,
  COLOUR_PRESENCE,
  getAntiSMASHColour,
  getCOGColour,
  getCRISPRColour,
  getFeatureTypeColour,
  getMiBIGColor,
} from 'components/Analysis/ContigViewer/mgnifyColours';
import ExtLink from 'components/UI/ExtLink';
import Tooltip from 'components/UI/Tooltip';
import ROCratePreview from 'components/IGV/ROCrateTrack';
import { useEffectOnce } from 'react-use';
import { find } from 'lodash-es';

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

export const FORMAT = {
  GENOME: 'GENOME',
  ASSEMBLY_V5: 'ASSEMBLY_V5',
};

export const annotationTrackCustomisations = (trackColorBy, format) => {
  switch (trackColorBy) {
    case 'cog':
      return {
        nameField: format === FORMAT.GENOME ? 'COG' : 'cog',
        color: (feature) => {
          const cog = maybeGetAttributeValue(feature, ['cog', 'COG']);
          return cog ? getCOGColour(cog) : '#ddd';
        },
      };
    case 'kegg':
      return {
        nameField: format === FORMAT.GENOME ? 'KEGG' : 'kegg',
        color: (feature) =>
          !maybeGetAttributeValue(feature, ['kegg', 'KEGG'])
            ? COLOUR_ABSENCE
            : COLOUR_PRESENCE,
      };
    case 'pfam':
      return {
        nameField: format === FORMAT.GENOME ? 'Pfam' : 'pfam',
        color: (feature) =>
          !maybeGetAttributeValue(feature, ['pfam', 'Pfam'])
            ? COLOUR_ABSENCE
            : COLOUR_PRESENCE,
      };
    case 'interpro':
      return {
        nameField: format === FORMAT.GENOME ? 'InterPro' : 'interpro',
        color: (feature) =>
          !maybeGetAttributeValue(feature, ['interpro', 'InterPro'])
            ? COLOUR_ABSENCE
            : COLOUR_PRESENCE,
      };
    case 'go':
      return {
        nameField: format === FORMAT.GENOME ? 'GO' : 'go',
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
    case 'nearest_MiBIG_class':
    case 'nearest_mibig_class':
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
    case 'amr':
      return {
        nameField: 'AMRFinderPlus_gene_symbol',
        color: (feature) =>
          !maybeGetAttributeValue(feature, [
            'amrfinderplus_gene_symbol',
            'AMRFinderPlus_gene_symbol',
          ])
            ? COLOUR_ABSENCE
            : COLOUR_PRESENCE,
      };
    case 'crispr':
      return {
        nameField: '_crispr_', // will default to ID, but must change to trigger re-render
        color: (feature) => getCRISPRColour(feature.type),
      };
    case 'type':
      return {
        nameField: 'ID',
        color: (feature) => getFeatureTypeColour(feature.type),
      };
    default:
      return {
        nameField: trackColorBy,
        color: (feature) =>
          !maybeGetAttributeValue(feature, [trackColorBy])
            ? COLOUR_ABSENCE
            : COLOUR_PRESENCE,
      };
  }
};

const trackColorOptionsForType = (track) => {
  const trackType = track.id;
  const { crate } = track.config;
  if (crate) {
    const options = crate.tree.variableMeasured.map((vm) => ({
      label: vm.name[0]['@value'],
      value: vm.value[0]['@value'],
    }));
    if (options.length) {
      return { options, default: options[0].value };
    }
    return { options };
  }
  switch (trackType) {
    case 'SanntiS annotation':
      return {
        options: [{ label: 'MiBIG class', value: 'mibig' }],
        default: 'mibig',
      };
    case 'Viral annotation':
      return {
        options: [{ label: 'ViPhOG existence', value: 'viphog' }],
        default: 'viphog',
      };
    case 'antiSMASH':
      return {
        options: [{ label: 'AntiSMASH cluster type', value: 'antismash' }],
        default: 'antismash',
      };
    case 'Functional annotation':
    default:
      return {
        options: [
          { label: 'Feature type', value: 'type' },
          {
            label: 'Protein function annotations',
            options: [
              { label: 'COG category', value: 'cog' },
              { label: 'GO (gene ontology) existence', value: 'go' },
              { label: 'InterPro existence', value: 'interpro' },
              { label: 'KEGG ortholog', value: 'kegg' },
              { label: 'Pfam family existence', value: 'pfam' },
              { label: 'AMR existence', value: 'amr' },
            ],
          },
          {
            label: 'Other features',
            options: [
              { label: 'AntiSMASH cluster type', value: 'antismash' },
              { label: 'MiBIG class', value: 'mibig' },
              { label: 'ViPhOG existence', value: 'viphog' },
              { label: 'CRISPR component', value: 'crispr' },
            ],
          },
        ],
        default: 'type',
      };
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
  const { options, default: defaultValue } = trackColorOptionsForType(
    trackView.track
  );
  const existingSelection = trackColorBys[trackView.track.id];
  useEffectOnce(() => {
    if (!existingSelection) {
      //   First mount of selector widget and no config already set.
      //   Set to predefined default.
      const defaultOption = find(options, (o) => o.value === defaultValue);
      onChange(defaultOption, { action: 'select-option' });
    }
  });
  return (
    <div className="vf-stack vf-stack--200">
      <label
        className="vf-form__label"
        htmlFor={`track-colour-${trackView.track.id}`}
      >
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
        options={options}
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
      {/*<ROCratePreview crateUrl={trackView.track.url} />*/}
      {trackView.track._name === 'Analysis RO Crate' && (
        <ROCratePreview crateUrl={trackView.track.url} />
      )}
    </div>
  );
};
