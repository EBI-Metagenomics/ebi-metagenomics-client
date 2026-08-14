export const searchRegExp = (
  rawTerm: string,
  wholeWord = false
): RegExp | undefined => {
  const term = rawTerm.trim();
  if (!term) return undefined;

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = wholeWord ? `(?<![^\\s,=;])${escaped}(?![^\\s,=;])` : escaped;
  return new RegExp(pattern, 'iu');
};
