// eslint-disable-next-line import/prefer-default-export
export const singularise = (str: string) => {
  const lastTwoChars = str.slice(-2);
  return lastTwoChars === 'es' ? `${str.slice(0, -2)}y` : str.slice(0, -1);
};
