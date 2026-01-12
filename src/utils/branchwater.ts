export interface BranchwaterResult {
  acc?: string;
  assay_type?: string;
  bioproject?: string;
  biosample_link?: string;
  cANI?: number | string;
  collection_date_sam?: string;
  containment?: number | string;
  geo_loc_name_country_calc?: string;
  organism?: string;
  lat_lon?: [number, number] | string;
  [key: string]:
    | string
    | number
    | boolean
    | [number, number]
    | null
    | undefined
    | unknown;
}

export interface MapSample {
  id: string;
  attributes: {
    latitude: number;
    longitude: number;
    organism: string;
    assay_type: string;
    country: string;
  };
}

export function parseLatLon(raw: unknown): [number, number] | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    const [lat, lon] = raw;
    const latNum = Number(lat);
    const lonNum = Number(lon);
    return Number.isFinite(latNum) && Number.isFinite(lonNum)
      ? [latNum, lonNum]
      : null;
  }
  let latLonStr = String(raw).trim();
  if (!latLonStr || latLonStr === 'NP') return null;
  // strip quotes then uppercase
  latLonStr = latLonStr
    .replace(/^"+|"+$/g, '')
    .trim()
    .toUpperCase();

  // invalid markers
  const invalidMarkers = [
    'MISSING',
    'NOT APPLICABLE',
    'NA',
    'N/A',
    'NULL',
    'NONE',
  ];
  if (invalidMarkers.includes(latLonStr)) return null;

  // Examples we want: "39.5886 N 20.1382 E", "12 N 32 W", "54.1883 N 7.9000 E"
  // Allow commas or spaces between the pairs.
  const latLonRegex =
    /^\s*([0-9]+(?:\.[0-9]+)?)\s*([NS])[\s,]+([0-9]+(?:\.[0-9]+)?)\s*([EW])\s*$/i;
  const match = latLonStr.match(latLonRegex);
  if (!match) return null;

  const lat = parseFloat(match[1]) * (match[2] === 'S' ? -1 : 1);
  const lon = parseFloat(match[3]) * (match[4] === 'W' ? -1 : 1);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return [lat, lon];
}

export function convertToMapSamples(data: BranchwaterResult[]): MapSample[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      // Skip missing/placeholder accessions
      if (!item.acc || item.acc === 'NP') return null;

      const coords = parseLatLon(item.lat_lon);
      if (!coords) return null;

      const [lat, lng] = coords;

      // Clean up country label: hide NP/uncalculated
      const countryRaw = (item.geo_loc_name_country_calc || '').trim();
      const country =
        !countryRaw || ['np', 'uncalculated'].includes(countryRaw.toLowerCase())
          ? 'Unspecified'
          : countryRaw;

      const organism = item.organism || 'Unknown organism';

      return {
        id: item.acc,
        attributes: {
          latitude: lat,
          longitude: lng,
          assay_type: item.assay_type,
          organism,
          country,
        },
      } as MapSample;
    })
    .filter(Boolean) as MapSample[];
}

export function getCountryColor(count: number, maxCount: number) {
  if (count === 0 || maxCount === 0) return '#FFEDA0';

  const intensity = count / maxCount;

  if (intensity > 0.8) return '#BD0026';
  if (intensity > 0.6) return '#E31A1C';
  if (intensity > 0.4) return '#FC4E2A';
  if (intensity > 0.2) return '#FD8D3C';
  return '#FEB24C';
}

export function getContainmentHistogram(results: BranchwaterResult[]) {
  const binsAsc = Array.from(
    { length: 10 },
    (_, index) => `${(index / 10).toFixed(1)}-${((index + 1) / 10).toFixed(1)}`
  );
  const countsAsc = new Array(10).fill(0) as number[];
  results.forEach((searchResult) => {
    const containment =
      typeof searchResult.containment === 'string'
        ? parseFloat(searchResult.containment)
        : searchResult.containment;
    if (typeof containment === 'number' && !isNaN(containment)) {
      const idx = Math.min(Math.floor(containment * 10), 9);
      countsAsc[idx]++;
    }
  });
  return {
    binsDesc: [...binsAsc].reverse().slice(0, -1),
    countsDesc: [...countsAsc].reverse().slice(0, -1),
  };
}

export function getCaniHistogram(results: BranchwaterResult[]) {
  const BIN_SIZE = 0.02;
  const NUM_BINS = Math.ceil(1 / BIN_SIZE);
  const binsAsc = Array.from({ length: NUM_BINS }, (_, index) => {
    const start = (index * BIN_SIZE).toFixed(2);
    const end = ((index + 1) * BIN_SIZE).toFixed(2);
    return `${start}-${end}`;
  });
  const countsAsc = new Array(NUM_BINS).fill(0) as number[];
  results.forEach((searchResult) => {
    const cani =
      typeof searchResult.cANI === 'string'
        ? parseFloat(searchResult.cANI)
        : searchResult.cANI;
    if (typeof cani === 'number' && !isNaN(cani)) {
      const idx = Math.min(Math.floor(cani / BIN_SIZE), NUM_BINS - 1);
      countsAsc[idx]++;
    }
  });

  const binsDesc = [...binsAsc].reverse();
  const countsDesc = [...countsAsc].reverse();

  // Remove empty values at the end of the x-axis (which are at the end of our Desc arrays)
  let lastNonZeroIndex = countsDesc.length - 1;
  while (lastNonZeroIndex >= 0 && countsDesc[lastNonZeroIndex] === 0) {
    lastNonZeroIndex -= 1;
  }

  return {
    binsDesc: binsDesc.slice(0, lastNonZeroIndex + 1),
    countsDesc: countsDesc.slice(0, lastNonZeroIndex + 1),
  };
}

export function getScatterData(results: BranchwaterResult[]) {
  const xs: number[] = [];
  const ys: number[] = [];
  const texts: string[] = [];
  const colors: string[] = [];
  results.forEach((result) => {
    const containment =
      typeof result.containment === 'string'
        ? parseFloat(result.containment)
        : result.containment;
    const cani =
      typeof result.cANI === 'string' ? parseFloat(result.cANI) : result.cANI;
    const hasNums =
      typeof containment === 'number' &&
      !isNaN(containment) &&
      typeof cani === 'number' &&
      !isNaN(cani);
    if (hasNums) {
      xs.push(containment as number);
      ys.push(cani as number);
      texts.push(
        `${result.acc}\nCountry: ${
          result.geo_loc_name_country_calc || 'Unknown'
        }\nOrganism: ${result.organism || 'Unknown'}`
      );
      colors.push(
        result.assay_type === 'WGS'
          ? 'rgba(255, 99, 132, 0.8)'
          : 'rgba(54, 162, 235, 0.8)'
      );
    }
  });
  const MAX_POINTS = 20000;
  if (xs.length <= MAX_POINTS) {
    return { xs, ys, texts, colors, sampled: false, total: xs.length };
  }
  // Downsample by deterministic stride to keep distribution without RNG
  const stride = Math.ceil(xs.length / MAX_POINTS);
  const sxs: number[] = [];
  const sys: number[] = [];
  const stexts: string[] = [];
  const scols: string[] = [];
  for (let index = 0; index < xs.length; index += stride) {
    sxs.push(xs[index]);
    sys.push(ys[index]);
    stexts.push(texts[index]);
    scols.push(colors[index]);
  }
  return {
    xs: sxs,
    ys: sys,
    texts: stexts,
    colors: scols,
    sampled: true,
    total: xs.length,
  };
}

export function getTotalCountryCount(countryCounts: Record<string, number>) {
  return Object.values(countryCounts).reduce(
    (accumulator, count) => accumulator + count,
    0
  );
}

export function downloadBranchwaterCSV(results: BranchwaterResult[]) {
  if (!results || results.length === 0) return;

  // Prefer a known set of columns first, then append any additional keys found
  const preferredColumnOrder = [
    'acc',
    'assay_type',
    'bioproject',
    'cANI',
    'collection_date_sam',
    'containment',
    'geo_loc_name_country_calc',
    'organism',
  ];

  const allAvailableKeys = new Set<string>();
  results.forEach((result) =>
    Object.keys(result).forEach((key) => allAvailableKeys.add(key))
  );

  const remainingKeys = Array.from(allAvailableKeys).filter(
    (key) => !preferredColumnOrder.includes(key)
  );
  const finalColumns = [...preferredColumnOrder, ...remainingKeys];

  const escapeCSVValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';

    const getStringValue = (val: unknown): string => {
      if (Array.isArray(val)) return val.join(';');
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    };

    const stringValue = getStringValue(value);
    const escapedValue = stringValue.replace(/"/g, '""');

    const needsQuotes = /[",\n]/.test(stringValue);
    return needsQuotes ? `"${escapedValue}"` : escapedValue;
  };

  const formatCSVCell = (column: string, value: unknown): string => {
    if (column !== 'lat_lon') return escapeCSVValue(value);

    if (Array.isArray(value)) return escapeCSVValue(value.join(','));

    const trimmedValue = String(value ?? '')
      .trim()
      .replace(/^['"]+|['"]+$/g, '');

    if (!trimmedValue) return escapeCSVValue('');

    const lowerCasedValue = trimmedValue.toLowerCase();
    const isMissing = ['missing', 'np', 'uncalculated'].includes(
      lowerCasedValue
    );

    if (isMissing) return escapeCSVValue('Not provided');

    return escapeCSVValue(trimmedValue);
  };

  const csvHeader = finalColumns
    .map((column) => escapeCSVValue(column))
    .join(',');
  const csvRows = results.map((row) =>
    finalColumns
      .map((column) => formatCSVCell(column, (row as any)[column]))
      .join(',')
  );

  const csvMetadata = 'Branchwater v0.4.0, database v2024-11-28';
  const csvContent = [csvMetadata, csvHeader, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(blob);
  const anchorElement = document.body.appendChild(document.createElement('a'));
  const now = new Date();
  const timeStamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getDate()).padStart(2, '0')}_${String(
    now.getHours()
  ).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  anchorElement.href = downloadUrl;
  anchorElement.download = `branchwater_results_${timeStamp}.csv`;
  anchorElement.click();
  document.body.removeChild(anchorElement);
  URL.revokeObjectURL(downloadUrl);
}

export function getCountryCountsFromResults(results: BranchwaterResult[]) {
  const countsByCountry: Record<string, number> = {};

  results.forEach((item) => {
    if (
      item.geo_loc_name_country_calc &&
      item.geo_loc_name_country_calc !== 'NP' &&
      item.geo_loc_name_country_calc !== 'uncalculated'
    ) {
      const country = item.geo_loc_name_country_calc;
      countsByCountry[country] = (countsByCountry[country] || 0) + 1;
    }
  });

  return countsByCountry;
}

export interface VisualizationData {
  barPlotData: Record<string, unknown>[];
  histogramData: Record<string, unknown>[];
  mapData: Record<string, unknown>[];
  stringKeys: string[];
}

function countUniqueValuesAndOccurrences(valueList: string[]): {
  uniqueValues: string[];
  countVal: number[];
} {
  const counts = new Map<string, number>();
  valueList.forEach((item) => {
    const key = String(item ?? '');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const uniqueValues = Array.from(counts.keys());
  const countVal = uniqueValues.map((key) => counts.get(key) as number);
  return { uniqueValues, countVal };
}

function createPlotData(
  stringKeys: string[],
  stringValues: string[][]
): Record<string, unknown>[] {
  const plotData: Record<string, unknown>[] = [];
  const plotColor = 'rgba(100, 200, 102, 1)';

  for (let index = 0; index < stringKeys.length; index++) {
    const visible = index === 0;
    const { uniqueValues, countVal } = countUniqueValuesAndOccurrences(
      stringValues[index]
    );
    plotData.push({
      x: uniqueValues,
      y: countVal,
      type: 'bar',
      width: 0.2,
      marker: {
        color: 'rgba(100, 200, 102, 0.7)',
        line: {
          color: plotColor,
          width: 1,
        },
      },
      name: stringKeys[index],
      visible,
    });
  }

  return plotData;
}

export function prepareVisualizationData(
  data: BranchwaterResult[]
): VisualizationData | null {
  if (!data || data.length === 0) return null;

  const commonKeys = Array.from(new Set(data.flatMap(Object.keys)));

  const values: Record<string | number, unknown>[][] = commonKeys.map((key) =>
    data.map((row) => row[key])
  );

  const stringKeys: string[] = [];
  const stringValues: string[][] = [];

  for (let index = 0; index < values.length; index++) {
    const key = commonKeys[index];
    if (['acc', 'biosample_link', 'lat_lon'].includes(key)) continue;

    const column = values[index];
    const isAllStrings = column.every((value) => value == null);
    if (isAllStrings) {
      stringKeys.push(key);
      stringValues.push(
        column.map((value) => (value == null ? '' : String(value)))
      );
    }
  }

  const barPlotData = createPlotData(stringKeys, stringValues);

  const numCol = (index: number) =>
    index === -1
      ? []
      : (values[index]
          .map((value) => Number(value))
          .filter((num) => Number.isFinite(num)) as number[]);

  const containmentIndex = commonKeys.indexOf('containment');
  const cANIIndex = commonKeys.indexOf('cANI');

  const hist: Record<string, unknown>[] = [];

  if (containmentIndex !== -1) {
    const containmentValues = numCol(containmentIndex);
    if (containmentValues.length) {
      hist.push({
        x: containmentValues,
        type: 'histogram',
        autobinx: false,
        xbins: { size: 0.1 },
        name: 'containment',
        visible: true,
        marker: {
          color: 'rgba(100, 200, 102, 0.7)',
          line: { color: 'rgba(100, 200, 102, 1)', width: 1 },
        },
      });
    }
  }

  if (cANIIndex !== -1) {
    const caniValues = numCol(cANIIndex);
    if (caniValues.length) {
      hist.push({
        x: caniValues,
        type: 'histogram',
        autobinx: false,
        xbins: { size: 0.02 },
        name: 'cANI',
        visible: hist.length === 0,
        marker: {
          color: 'rgba(100, 200, 102, 0.7)',
          line: { color: 'rgba(100, 200, 102, 1)', width: 1 },
        },
      });
    }
  }

  const countryIndex = commonKeys.indexOf('geo_loc_name_country_calc');
  let countryMap: Record<string, unknown> = {};

  if (countryIndex !== -1) {
    const cleanedCountries = values[countryIndex]
      .map((value) => (value == null ? '' : String(value).trim()))
      .filter((value) => {
        const lowerCasedValue = value.toLowerCase();
        return (
          value &&
          lowerCasedValue !== 'np' &&
          lowerCasedValue !== 'uncalculated'
        );
      });

    const uniqueCountryCounts =
      countUniqueValuesAndOccurrences(cleanedCountries);
    if (uniqueCountryCounts.uniqueValues.length > 0) {
      const countryData = uniqueCountryCounts.uniqueValues.map(
        (country, index) => ({
          country,
          count: uniqueCountryCounts.countVal[index],
        })
      );

      countryMap = {
        name: 'geo_loc_name_country_calc',
        type: 'choropleth',
        locationmode: 'country names',
        locations: countryData.map((dataItem) => dataItem.country),
        z: countryData.map((dataItem) => dataItem.count),
        text: countryData.map(
          (dataItem) => `${dataItem.country}: ${dataItem.count}`
        ),
        autocolorscale: true,
        marker: { line: { color: 'rgb(255,255,255)', width: 2 } },
      };
    }
  }

  const latLonIndex = commonKeys.indexOf('lat_lon');
  let latLonMap: Record<string, unknown> = {};

  if (latLonIndex !== -1) {
    const latLonData = values[latLonIndex]
      .map((raw, index) => {
        const coords = parseLatLon(raw);
        const acc = data[index]?.acc;
        if (!coords || !acc || acc === 'NP') return null;
        return [coords[0], coords[1], acc] as [number, number, string];
      })
      .filter(Boolean) as [number, number, string][];

    if (latLonData.length > 0) {
      latLonMap = {
        name: 'lat_lon',
        type: 'scattergeo',
        mode: 'markers',
        marker: { color: 'rgba(100, 200, 102, 1)' },
        lat: latLonData.map((latLonTuple) => latLonTuple[0]),
        lon: latLonData.map((latLonTuple) => latLonTuple[1]),
        text: latLonData.map((latLonTuple) => `acc: ${latLonTuple[2]}`),
      };
    }
  }
  return {
    barPlotData,
    histogramData: hist,
    mapData: [countryMap, latLonMap].filter(
      (obj) => obj && Object.keys(obj).length > 0
    ),
    stringKeys,
  };
}

export function processBranchwaterResults(data: any): {
  resultsArray: BranchwaterResult[];
  vizData: VisualizationData | null;
  mapData: MapSample[];
  countryCounts: Record<string, number>;
} {
  const resultsArray = Array.isArray(data) ? (data as BranchwaterResult[]) : [];
  const vizData = prepareVisualizationData(resultsArray);
  const mapData = convertToMapSamples(resultsArray);
  const countryCounts = getCountryCountsFromResults(resultsArray);

  return {
    resultsArray,
    vizData,
    mapData,
    countryCounts,
  };
}
