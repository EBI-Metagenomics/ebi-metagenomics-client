export const COG_MAP = {
  // https://gka.github.io/palettes/#/23|s|1d4097,a8a8a8,87352f|ffaff9,908300,17439b|0|0
  A: '#1d4097', // RNA processing and modification
  B: '#36539a', // Chromatin Structure and dynamics
  C: '#50669d', // Energy production and conversion
  D: '#6979a0', // Cell cycle control and mitosis
  E: '#828ca3', // Amino Acid metabolis and transport
  F: '#9b9fa6', // Nucleotide metabolism and transport
  G: '#a59e9d', // Carbohydrate metabolism and transport
  H: '#9f8987', // Coenzyme metabolis
  I: '#997471', // Lipid metabolism
  J: '#935f5b', // Tranlsation
  K: '#8d4a45', // Transcription
  L: '#87352f', // Replication and repair
  M: '#eba7cc', // Cell wall/membrane/envelop biogenesis
  N: '#d79f9e', // Cell motility
  O: '#c29771', // Post-translational modification, protein turnover, chaperone functions
  P: '#ae8f44', // Inorganic ion transport and metabolism
  Q: '#9a8717', // Secondary Structure
  T: '#937a03', // Signal Transduction
  U: '#9a690a', // Intracellular trafficing and secretion
  Y: '#a15711', // Nuclear structure
  Z: '#a84617', // Cytoskeleton
  S: '#af341e', // Function Unknown
  R: '#b62325', // General Functional Prediction only
};

const ANTISMASH_MAP_GK = {
  biosynthetic: '#810e15',
  'biosynthetic-additional': '#f16d75',
  transport: '#6495ED',
  regulatory: '#2E8B57',
  resis: '#ed90ed',
  other: '#BEBEBE',
};

const MIBIG_MAP = {
  alkaloid: 'purple',
  nrp: 'seagreen',
  polyketide: 'sandybrown',
  ripp: 'royalblue',
  saccharide: 'burlywood',
  terpene: 'deeppink',
  other: 'midnightblue',
};

/**
 * Get the colour for the COG cateogry.
 * If the category is not mapped then use the R, this also
 * applies if the suplied category is not found (for example: multiles COG categories)
 */
export function getCOGColour(cog) {
  return COG_MAP[cog] || COG_MAP.R;
}

/**
 * Get the colour for the antiSMASH gene_kind.
 */
export function getAntiSMASHColour(kind) {
  return ANTISMASH_MAP_GK[kind] || ANTISMASH_MAP_GK.other;
}

export function getMiBIGColor(mibigClass) {
  return MIBIG_MAP[mibigClass.toLowerCase().split()[0]] || '#BEBEBE';
}

export const COLOUR_PRESENCE = '#d32f2f';
export const COLOUR_ABSENCE = '#a9abaa';
