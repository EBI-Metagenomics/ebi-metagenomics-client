/**
 * Remove the s__ prefixes from a lineage.
 * @param {string} lineage string with the lineage `d__Bacteria;p__Proteobacteria;c__Gammapr...`
 * @param {string} replace replace string
 * @return {string}
 */
export function cleanTaxLineage(lineage: string, replace = ''): string {
  let cleaned = lineage
    .replace(/;/g, '')
    .replace(/[d|p|c|o|f|g|s]__/g, replace);
  if (cleaned.startsWith(replace)) {
    cleaned = cleaned.substring(replace.length).trimStart();
  }
  return cleaned;
}

/**
 * Retrieve a non-blank taxonomic identity from the species level or upwards
 * @param {string} fullLineage
 * @param {bool} removePrefix true if this should remove the 'd|p|c|o|f|g|s__' prefix
 * @return {string}
 */
export function getSimpleTaxLineage(
  fullLineage: string,
  removePrefix: boolean
): string {
  const l = fullLineage.split(';');
  let head = l.pop();
  // Remove all until species
  while (head.indexOf('s__') === -1) {
    head = l.pop();
  }
  // Find first non-null
  while (head.length <= 3) {
    head = l.pop();
  }
  if (removePrefix && head) {
    return cleanTaxLineage(head);
  }
  return head;
}

export const TAXONOMY_COLOURS = [
  '#ABD3DB',
  '#F2D9D0',
  '#F2A477',
  '#5F9595',
  '#D9C4B8',
  '#EEEEAB',
  '#8990B3',
  '#DEFFE3',
  '#A0B392',
  '#DEE3FF',
  '#F2F2F2',
];
