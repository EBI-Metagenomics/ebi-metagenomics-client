import React from 'react';
import ExtLink from 'components/UI/ExtLink';
import './style.css';

type PropertyDataType = { name: string; value: string | number };
type GenomeBrowserPopupProps = {
  data: PropertyDataType[];
};
type FormattedData = {
  name?: string;
  gene?: string;
  product?: string;
  properties: {
    title: string;
    data: {
      name?: string;
      Value?: string | React.ElementType;
    }[];
  }[];
};

const antiSMASHLabels = {
  biosynthetic: 'Core biosynthetic gene',
  'biosynthetic-additional': 'Additional biosynthetic gene',
  regulatory: 'Regulatory genes',
  transport: 'Transport-related gene',
  resistance: 'Resistance genes',
};

const MultipleField: React.FC<{
  value: string;
  url?: string;
  decodeValue?: boolean;
  filterValue?: (value: string) => boolean;
}> = ({ value, url, decodeValue, filterValue = () => true }) => {
  if (!value) return null;
  const parts = value.split(',').filter(filterValue);
  return (
    <ul className="vf-list">
      {parts.map((part) => {
        const text = decodeValue ? decodeURIComponent(part) : part;
        return (
          <li key={part} className="igv-popup-multiple-field-item">
            {url ? <ExtLink href={`${url}${part}`}>{text}</ExtLink> : text}
          </li>
        );
      })}
    </ul>
  );
};

const getAnnotationLoc = (attributes: {
  location?: string;
}): { start: number; end: number } => {
  if (attributes.location) {
    const startEnd = attributes.location.split(':')[1];
    return {
      start: parseInt(startEnd.split('-')[0].replaceAll(',', ''), 10),
      end: parseInt(startEnd.split('-')[1].replaceAll(',', ''), 10),
    };
  }
  return undefined;
};

/**
 * Calculate the property length.
 * @return {int} the length or undefined
 */
const getProteinOrSequenceLength = (attributes: {
  location?: string;
  type?: string;
}): number => {
  if (!attributes.location || !attributes.type) return undefined;
  const { start, end } = getAnnotationLoc(attributes);
  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start === null ||
    end === null
  ) {
    return undefined;
  }
  if (attributes.type === 'CDS') {
    return Math.ceil((end - start) / 3);
  }
  return end - start;
};

const formatData = (rawData: PropertyDataType[]): FormattedData => {
  const attributes: {
    [name: string]: string | null;
  } = rawData.reduce((memo, el) => {
    if (el.name)
      // eslint-disable-next-line no-param-reassign
      memo[el.name.toLowerCase().replaceAll(':', '')] =
        el.value === null ? null : String(el.value);
    return memo;
  }, {});
  // TODO: Implement using something similar to the TrackColourPicker.FORMAT to handle differences
  const ecnumber = attributes.ec_number || attributes.ecnumber;

  const functionalData = {
    title: 'Functional annotation',
    data: [
      {
        name: 'E.C Number',
        Value:
          ecnumber &&
          (() => (
            <MultipleField
              value={ecnumber}
              url="https://enzyme.expasy.org/EC/"
              filterValue={(ecNumber) => {
                // https://en.wikipedia.org/wiki/Enzyme_Commission_number
                return /[n\d-]+\.[n\d-]+\.[n\d-]+\.[n\d-]+/.test(ecNumber);
              }}
            />
          )),
      },
      {
        name: 'Pfam',
        Value:
          attributes.pfam &&
          (() => (
            <MultipleField
              value={attributes.pfam}
              url="https://www.ebi.ac.uk/interpro/entry/pfam/"
              filterValue={(pfamAccession) => {
                return pfamAccession.startsWith('PF');
              }}
            />
          )),
      },
      {
        name: 'KEGG',
        Value:
          attributes.kegg &&
          (() => (
            <MultipleField
              value={attributes.kegg}
              url="https://www.genome.jp/dbget-bin/www_bget?"
              filterValue={(keggAccession) => {
                return keggAccession.startsWith('ko:K');
              }}
            />
          )),
      },
      {
        name: 'eggNOG',
        Value: attributes.eggnog && decodeURIComponent(attributes.eggnog),
      },
      {
        name: 'COG',
        Value:
          attributes.cog && (() => <MultipleField value={attributes.cog} />),
      },
      {
        name: 'GO',
        Value:
          attributes.go &&
          (() => (
            <MultipleField
              value={attributes.go}
              url="https://www.ebi.ac.uk/ols/search?q="
              filterValue={(goAccession) => {
                return goAccession.startsWith('GO:');
              }}
            />
          )),
      },
      {
        name: 'InterPro',
        Value:
          attributes.interpro &&
          (() => (
            <MultipleField
              value={attributes.interpro}
              url="https://www.ebi.ac.uk/interpro/entry/InterPro/"
              filterValue={(ipsAccession) => {
                return ipsAccession.startsWith('IPR');
              }}
            />
          )),
      },
      {
        // antiSMASH
        name: 'Gene type',
        Value:
          attributes.as_type &&
          (antiSMASHLabels[attributes.as_type] || attributes.as_type),
      },
      {
        name: 'ViPhOG',
        Value:
          attributes.viphog &&
          (() => (
            <ExtLink href="https://osf.io/2zd9r/">
              {attributes.viphog} ({attributes.viphog_taxonomy})
            </ExtLink>
          )),
      },
      {
        // Notes are URL encoded during the GFF generation
        name: 'Notes',
        Value:
          attributes.as_notes &&
          (() => (
            <MultipleField value={decodeURIComponent(attributes.as_notes)} />
          )),
      },
      {
        name: 'Cluster',
        Value:
          attributes.as_gene_clusters &&
          (() => <MultipleField value={attributes.as_gene_clusters} />),
      },
    ],
  };
  const { start, end } = getAnnotationLoc(attributes);
  const isProtein = attributes.type === 'CDS';
  const otherData = {
    title: 'Feature details',
    data: [
      {
        name: 'Type',
        Value: attributes.type,
      },
      {
        name: 'Inference',
        Value: attributes.inference,
      },
      {
        name: 'Start / End',
        Value: `${start} / ${end}`,
      },
      {
        name: isProtein ? 'Protein length' : 'Sequence length',
        Value: String(getProteinOrSequenceLength(attributes)),
      },
    ],
  };

  const metaproteomicData = {
    title: 'Metaproteomics',
    data: [
      {
        name: 'PRIDE Dataset',
        Value:
          attributes.pride_id &&
          (() => (
            <ExtLink
              href={`https://www.ebi.ac.uk/pride/archive/projects/${attributes.pride_id}`}
            >
              {attributes.pride_id}
            </ExtLink>
          )),
      },
      {
        name: 'Unique peptide-to-protein mappings',
        Value:
          attributes.unique_peptide_to_protein_mapping === 'True'
            ? () => <div />
            : 'None',
      },
      {
        name:
          attributes.unique_peptide_to_protein_mapping === 'True'
            ? 'List of peptides'
            : '',
        Value:
          attributes.unique_peptide_to_protein_mapping === 'True'
            ? () => <MultipleField value={attributes.unambiguous_sequences} />
            : () => <div />,
      },
      {
        name: 'Ambiguous peptide-to-protein mappings',
        Value:
          attributes.ambiguous_peptide_to_protein_mapping === 'True'
            ? () => <div />
            : 'None',
      },
      {
        name:
          attributes.ambiguous_peptide_to_protein_mapping === 'True'
            ? 'List of peptides'
            : '',
        Value:
          attributes.ambiguous_peptide_to_protein_mapping === 'True'
            ? () => <MultipleField value={attributes.ambiguous_sequences} />
            : () => <div />,
      },
      {
        name: 'Semi-quantitative expression spectrum count',
        Value: attributes.semiquantitative_expression_spectrum_count,
      },
    ],
  };

  const bgcData = {
    title: 'Biosynthetic Gene Cluster details',
    data: [
      {
        name: 'Nearest MiBIG',
        Value:
          attributes.nearest_mibig &&
          (() => (
            <ExtLink
              href={`https://mibig.secondarymetabolites.org/repository/${attributes.nearest_mibig}`}
            >
              {attributes.nearest_mibig}
            </ExtLink>
          )),
      },
      {
        name: 'Nearest MiBIG Class',
        Value: attributes.nearest_mibig_class,
      },
    ],
  };

  const amrData = {
    title: 'Anti-microbial resistance',
    data: [
      {
        name: 'AMRFinderPlus gene symbol',
        Value: attributes.amrfinderplus_gene_symbol,
      },
      {
        name: 'AMRFinderPlus sequence name',
        Value: attributes.amrfinderplus_sequence_name,
      },
      {
        name: 'AMRFinderPlus scope',
        Value: attributes.amrfinderplus_scope,
      },
      {
        name: 'Element type',
        Value: attributes.element_type,
      },
      {
        name: 'Element subtype',
        Value: attributes.element_subtype,
      },
      {
        name: 'Drug class',
        Value: attributes.drug_class,
      },
      {
        name: 'Drug subclass',
        Value: attributes.drug_subclass,
      },
    ],
  };

  const crisprData = {
    title: 'CRISPR details',
    data: [
      {
        name: 'sequence',
        Value: attributes.sequence || attributes.dr,
      },
    ],
  };
  if (attributes.type === 'CRISPR') {
    crisprData.data.push(
      {
        name: 'CRISPRCasFinder evidence level',
        Value: attributes.evidence_level,
      },
      { name: 'Potential direction', Value: attributes.potential_direction },
      { name: 'Number of spacers', Value: attributes.number_of_spacers },
      { name: 'Direct repeat length', Value: attributes.dr_length }
    );
  }

  const ncRnaData = {
    title: 'ncRNA details',
    data: [
      {
        name: 'Type',
        Value: attributes.type,
      },
      {
        name: 'ncRNA Class',
        Value: attributes.ncrna_class || 'Unspecified',
      },
      {
        name: 'Rfam accession',
        Value:
          attributes.rfam &&
          (() => (
            <MultipleField
              value={attributes.rfam}
              url="https://rfam.org/family/"
            />
          )),
      },
    ],
  };

  const properties = [functionalData, otherData];
  if (attributes.source.toLowerCase().includes('crispr')) {
    properties.push(crisprData);
  }
  if (attributes.pride_id) {
    properties.push(metaproteomicData);
  }
  if (attributes.nearest_mibig) {
    properties.push(bgcData);
  }
  if (attributes.amrfinderplus_gene_symbol) {
    properties.push(amrData);
  }
  if (
    attributes.type.toLowerCase() === 'ncrna' ||
    attributes.type.toLowerCase() === 'rrna'
  ) {
    properties.push(ncRnaData);
  }

  return {
    name: attributes.id || attributes.name,
    gene: attributes.gene,
    product: attributes.product,
    properties,
  };
};

const GenomeBrowserPopup: React.FC<GenomeBrowserPopupProps> = ({ data }) => {
  const { name, gene, product, properties } = formatData(data);
  return (
    <>
      <table className="stack hover igv-popover-table">
        <caption className="igv-popover-section-header">Feature</caption>
        <tbody>
          {name && (
            <tr>
              <td className="igv-popover-table-td-name">ID</td>
              <td>{name}</td>
            </tr>
          )}
          {gene && (
            <tr>
              <td className="igv-popover-table-td-name">Gene</td>
              <td>
                <em>{gene}</em>
              </td>
            </tr>
          )}
          {product && (
            <tr>
              <td className="igv-popover-table-td-name">Product</td>
              <td>{product}</td>
            </tr>
          )}
        </tbody>
      </table>
      {properties.map((property) => (
        <table className="stack hover igv-popover-table" key={property.title}>
          {property.data.filter((d) => !!d.Value).length > 0 && (
            <caption className="igv-popover-section-header">
              {property.title}
            </caption>
          )}
          <tbody>
            {property.data
              .map(
                ({ name: pName, Value }) =>
                  Value && (
                    <tr key={pName}>
                      <td className="igv-popover-table-td-name">{pName}</td>
                      <td>{typeof Value === 'string' ? Value : <Value />}</td>
                    </tr>
                  )
              )
              .filter(Boolean)}
          </tbody>
        </table>
      ))}
    </>
  );
};

export default GenomeBrowserPopup;
