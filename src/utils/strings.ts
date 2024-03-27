// eslint-disable-next-line import/prefer-default-export
export const singularise = (str: string) => {
  // Non-exhaustive singulariser, only handles some common English cases so use with care / add more rules.
  // Consider adding a string store if really needed.
  if (str.endsWith('ies')) {
    // e.g. assemblies, but will fail on species
    return `${str.slice(0, -3)}y`;
  }
  if (str.endsWith('ses')) {
    // e.g. analyses, but will fail on busses
    return `${str.slice(0, -3)}sis`;
  }
  if (str.endsWith('s')) {
    // e.g. projects, but will fail on boxes
    return `${str.slice(0, -1)}`;
  }
  if (str.endsWith('a')) {
    // e.g. data, but will fail on criteria
    return `${str.slice(0, -1)}um`;
  }
  return str;
};
