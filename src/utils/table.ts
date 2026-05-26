/**
 * Formats a value for display in a table cell.
 * Returns 'N/A' for null, undefined, or empty strings.
 * Optional numeric formatting is supported.
 */
export const formatValue = (
  value: any,
  options: {
    precision?: number;
    suffix?: string;
    placeholder?: string;
  } = {}
): string => {
  const { precision, suffix = '', placeholder = 'N/A' } = options;

  if (
    value === null ||
    value === undefined ||
    value === '' ||
    value === 'null'
  ) {
    return placeholder;
  }

  let formattedValue = value;

  if (typeof value === 'number' && precision !== undefined) {
    formattedValue = value.toFixed(precision);
  }

  return `${formattedValue}${suffix}`;
};

export default formatValue;
