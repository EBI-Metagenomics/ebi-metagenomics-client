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
}> = ({ value, url, decodeValue }) => {
  if (!value) return null;
  const parts = value.split(',');
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

/**
 * Calculate the property length.
 * @return {int} the length or undefined
 */
const getProtLength = (attributes: {
  start?: string | number | null;
  end?: string | number | null;
}): number => {
  const start =
    typeof attributes.start === 'string'
      ? parseInt(attributes.start, 10)
      : attributes.start;
  const end =
    typeof attributes.end === 'string'
      ? parseInt(attributes.end, 10)
      : attributes.end;
  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start === null ||
    end === null
  ) {
    return undefined;
  }
  return Math.ceil((end - start) / 3);
};
const formatData = (rawData: PropertyDataType[]): FormattedData => {
  const attributes: {
    [name: string]: string | null;
  } = rawData.reduce((memo, el) => {
    // eslint-disable-next-line no-param-reassign
    if (el.name) memo[el.name.toLowerCase()] = el.value;
    return memo;
  }, {});

  const functionalData = {
    title: 'Functional annotation',
    data: [
      {
        name: 'E.C Number',
        Value:
          attributes.ecnumber &&
          (() => (
            <MultipleField
              value={attributes.ecnumber}
              url="https://enzyme.expasy.org/EC/"
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
              url="https://pfam.xfam.org/family/"
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
              url="https://www.ebi.ac.uk/interpro/entry/InterPro/'"
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
        Value: `${attributes.start}/${attributes.end}`,
      },
      {
        name: 'Protein length',
        Value: String(getProtLength(attributes)),
      },
    ],
  };

  const metaproteomicData = {
    title: 'Metaproteomics',
    data: [
      {
        name: 'Peptide sequences',
        Value:
          attributes.peptide_sequences &&
          (() => (
            <MultipleField value={attributes.peptide_sequences} decodeValue />
          )),
      },
      {
        name: 'Pride ID',
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
    ],
  };

  return {
    name: attributes.id,
    gene: attributes.gene,
    product: attributes.product,
    properties: [functionalData, otherData, metaproteomicData],
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
