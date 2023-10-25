const absInfo: Record<string, string> = {
  Algeria: 'ABS laws',
  Angola: 'ABS laws coming',
  Benin: 'ABS laws',
  Botswana: 'ABS laws coming',
  'Burkina Faso': 'ABS laws',
  Burundi: 'No ABS laws',
  'Cabo Verde': 'Unclear',
  Cameroon: 'ABS laws',
  'Central African Republic': 'No ABS laws',
  Chad: 'No ABS laws',
  Comoros: 'ABS laws',
  Congo: 'ABS laws',
  'Côte d’Ivoire': 'Unclear',
  'Democratic Republic of Congo': 'ABS laws',
  Djibouti: 'No ABS laws',
  Egypt: 'ABS laws coming',
  'Equatorial Guinea': 'No ABS laws',
  Eritrea: 'No ABS laws',
  Eswatini: 'No ABS laws',
  Ethiopia: 'ABS laws',
  Gabon: 'ABS laws',
  Gambia: 'No ABS laws',
  Ghana: 'No ABS laws',
  Guinea: 'No ABS laws',
  'Guinea-Bissau': 'No ABS laws',
  Kenya: 'ABS laws',
  Lesotho: 'Unclear',
  Liberia: 'No ABS laws',
  Libya: 'No ABS laws',
  Madagascar: 'ABS laws',
  Malawi: 'ABS laws',
  Mali: 'ABS laws coming',
  // Continue adding more countries and their ABS information here...
  'United States': 'No ABS laws',
};

// Create a function to get ABS information by country name
function getAbsInfo(countryName) {
  // Convert the input country name to title case for consistency
  const formattedCountryName = countryName
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  // Check if the country name exists in the ABS information object
  // eslint-disable-next-line no-prototype-builtins
  if (absInfo.hasOwnProperty(formattedCountryName)) {
    return absInfo[formattedCountryName];
  }
  return 'Country not found in ABS database'; // You can handle this case as needed
}
