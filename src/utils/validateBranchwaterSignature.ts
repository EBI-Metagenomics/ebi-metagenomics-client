export const BRANCHWATER_SIGNATURE_REQUIREMENTS = {
  hashFunction: '0.murmur64',
  ksize: 21,
  molecule: 'dna',
  scaled: 1000,
  seed: 42,
} as const;

type JsonObject = Record<string, unknown>;

export type BranchwaterSignatureValidation =
  | { valid: true }
  | { valid: false; error: string };

const supportedFormatDescription =
  'Required settings: DNA, k-mer size 21, scaled 1000, seed 42, and hash ' +
  'function 0.murmur64.';

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const scaledFromSketch = (sketch: JsonObject): number | null => {
  if (typeof sketch.scaled === 'number' && Number.isFinite(sketch.scaled)) {
    return sketch.scaled;
  }

  if (
    typeof sketch.max_hash !== 'number' ||
    !Number.isFinite(sketch.max_hash) ||
    sketch.max_hash <= 0
  ) {
    return null;
  }

  // Sourmash v0.4 signatures encode scaled via max_hash. This mirrors
  // sourmash's scaled_for_max_hash conversion.
  return Math.trunc(2 ** 64 / sketch.max_hash);
};

const invalid = (reason: string): BranchwaterSignatureValidation => ({
  valid: false,
  error: `${reason} ${supportedFormatDescription}`,
});

const displayValue = (value: unknown): string =>
  value === undefined || value === null || value === ''
    ? 'not set'
    : String(value);

const incompatibleSketchReason = (sketch: JsonObject): string | null => {
  const molecule =
    typeof sketch.molecule === 'string' ? sketch.molecule.toLowerCase() : '';

  if (molecule !== BRANCHWATER_SIGNATURE_REQUIREMENTS.molecule) {
    return `The sketch type is ${displayValue(
      sketch.molecule
    )} instead of DNA.`;
  }

  if (sketch.ksize !== BRANCHWATER_SIGNATURE_REQUIREMENTS.ksize) {
    return (
      'The sketch uses k-mer size ' +
      displayValue(sketch.ksize) +
      ' instead of ' +
      BRANCHWATER_SIGNATURE_REQUIREMENTS.ksize +
      '.'
    );
  }

  const scaled = scaledFromSketch(sketch);
  if (scaled !== BRANCHWATER_SIGNATURE_REQUIREMENTS.scaled) {
    return (
      'The sketch uses scaled value ' +
      displayValue(scaled) +
      ' instead of ' +
      BRANCHWATER_SIGNATURE_REQUIREMENTS.scaled +
      '.'
    );
  }

  if (sketch.seed !== BRANCHWATER_SIGNATURE_REQUIREMENTS.seed) {
    return (
      'The sketch uses seed ' +
      displayValue(sketch.seed) +
      ' instead of ' +
      BRANCHWATER_SIGNATURE_REQUIREMENTS.seed +
      '.'
    );
  }

  if (!Array.isArray(sketch.mins) || sketch.mins.length === 0) {
    return 'The sketch contains no MinHash values.';
  }

  return null;
};

const validateBranchwaterSignature = (
  signature: string
): BranchwaterSignatureValidation => {
  let parsedSignature: unknown;

  try {
    parsedSignature = JSON.parse(signature);
  } catch {
    return invalid('The selected .sig file is not valid JSON.');
  }

  const signatureRecords = Array.isArray(parsedSignature)
    ? parsedSignature
    : [parsedSignature];

  if (signatureRecords.length !== 1 || !isJsonObject(signatureRecords[0])) {
    return invalid(
      'The selected .sig file must contain exactly one Sourmash signature record.'
    );
  }

  const signatureRecord = signatureRecords[0];
  if (signatureRecord.class !== 'sourmash_signature') {
    return invalid('The selected file is not a Sourmash signature.');
  }

  if (
    signatureRecord.hash_function !==
    BRANCHWATER_SIGNATURE_REQUIREMENTS.hashFunction
  ) {
    return invalid(
      `The signature uses hash function ${displayValue(
        signatureRecord.hash_function
      )} instead of ${BRANCHWATER_SIGNATURE_REQUIREMENTS.hashFunction}.`
    );
  }

  if (
    !Array.isArray(signatureRecord.signatures) ||
    signatureRecord.signatures.length === 0 ||
    !signatureRecord.signatures.every(isJsonObject)
  ) {
    return invalid('The selected .sig file does not contain MinHash sketches.');
  }

  const sketchErrors = signatureRecord.signatures.map(incompatibleSketchReason);
  if (sketchErrors.every(Boolean)) {
    const reason =
      sketchErrors.length === 1
        ? sketchErrors[0]
        : 'The selected .sig file does not contain a Branchwater-compatible sketch.';
    return invalid(reason as string);
  }

  return { valid: true };
};

export default validateBranchwaterSignature;
