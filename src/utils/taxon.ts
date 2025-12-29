/**
 * Remove the s__ prefixes from a lineage.
 * @param {string} lineage string with the lineage `d__Bacteria;p__Proteobacteria;c__Gammapr...`
 * @param {string} replace replace string
 * @return {string}
 */
export function cleanTaxLineage(
  lineage: string | undefined,
  replace = ''
): string {
  const src = lineage ?? '';
  let cleaned = src.replace(/;/g, '').replace(/[d|p|c|o|f|g|s]__/g, replace);
  if (cleaned.startsWith(replace)) {
    cleaned = cleaned.substring(replace.length).trimStart();
  }
  console.log('cleaned ', cleaned);
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
  if (!fullLineage) {
    return '';
  }

  const parts = String(fullLineage)
    .split(';')
    .map((s) => (s ? s.trim() : s))
    .filter((s) => !!s);

  if (!parts.length) {
    return '';
  }

  // Prefer the most specific species level (s__) if present; otherwise use the
  // last available non-blank taxon (i.e. the tail of the lineage).
  let chosen: string | undefined;

  // Find the last occurrence of an s__ entry, if any
  for (let idx = parts.length - 1; idx >= 0; idx -= 1) {
    const p = parts[idx];
    if (p.indexOf('s__') !== -1) {
      chosen = p;
      // If this species token is effectively blank (e.g. 's__'), walk upwards
      // to find the first non-blank higher-rank token.
      if (chosen.length <= 3) {
        let j = idx - 1;
        while (j >= 0 && parts[j] && parts[j].length <= 3) {
          j -= 1;
        }
        chosen = j >= 0 ? parts[j] : undefined;
      }
      break;
    }
  }

  // If no species token found, fall back to the last non-blank part
  if (!chosen) {
    let j = parts.length - 1;
    while (j >= 0 && parts[j] && parts[j].length <= 3) {
      j -= 1;
    }
    chosen = j >= 0 ? parts[j] : undefined;
  }

  if (!chosen) return '';

  return removePrefix ? cleanTaxLineage(chosen) : chosen;
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
