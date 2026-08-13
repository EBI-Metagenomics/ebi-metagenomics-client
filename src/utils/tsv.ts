export const rowMatchesTSVSearch = (
  row: string[],
  rawSearchTerm: string
): boolean => {
  const searchTerm = rawSearchTerm.trim().toLowerCase();
  return (
    !!searchTerm &&
    row.some((cell) => String(cell).toLowerCase().includes(searchTerm))
  );
};

export type ReferenceDatabaseLookup = {
  name: string;
  pattern: RegExp;
  href: (match: RegExpMatchArray) => string;
};

export const ReferenceDatabaseLookups: ReferenceDatabaseLookup[] = [
  {
    name: 'Rhea',
    pattern: /\bRHEA:(\d+)\b/gi,
    href: (match) => `https://www.rhea-db.org/rhea/${match[1]}`,
  },
  {
    name: 'ChEBI',
    pattern: /\bCHEBI:(\d+)\b/gi,
    href: (match) => `https://www.ebi.ac.uk/chebi/CHEBI:${match[1]}`,
  },
  {
    name: 'InterPro',
    pattern: /\bIPR\d{6}\b/gi,
    href: (match) =>
      `https://www.ebi.ac.uk/interpro/entry/InterPro/${match[0].toUpperCase()}/`,
  },
  {
    name: 'Pfam',
    pattern: /\bPF\d{5}(?:\.\d+)?\b/gi,
    href: (match) =>
      `https://www.ebi.ac.uk/interpro/entry/pfam/${match[0]
        .split('.')[0]
        .toUpperCase()}/`,
  },
  {
    name: 'Gene Ontology',
    pattern: /\bGO:\d{7}\b/gi,
    href: (match) =>
      `https://www.ebi.ac.uk/QuickGO/term/${match[0].toUpperCase()}`,
  },
  {
    name: 'KEGG Orthology',
    pattern: /\b(?:ko:)?K\d{5}\b/gi,
    href: (match) =>
      `https://www.genome.jp/dbget-bin/www_bget?ko:${match[0]
        .replace(/^ko:/i, '')
        .toUpperCase()}`,
  },
];

export type ReferenceDatabaseMatch = {
  end: number;
  href: string;
  name: string;
  start: number;
  text: string;
};

export const findReferenceDatabaseMatches = (
  text: string
): ReferenceDatabaseMatch[] => {
  const matches = ReferenceDatabaseLookups.flatMap((lookup) => {
    const pattern = new RegExp(lookup.pattern.source, lookup.pattern.flags);
    return Array.from(text.matchAll(pattern), (match) => ({
      end: (match.index ?? 0) + match[0].length,
      href: lookup.href(match),
      name: lookup.name,
      start: match.index ?? 0,
      text: match[0],
    }));
  }).sort((a, b) => a.start - b.start || b.end - a.end);

  let previousEnd = 0;
  return matches.filter((match) => {
    if (match.start < previousEnd) return false;
    previousEnd = match.end;
    return true;
  });
};
