export type SourmashSignatureNormalisationTarget = 'branchwater' | 'sourmash';
export type SourmashSignatureEnvelope = 'object' | 'array';

/**
 * Return the signature in the required format: either one object or an array.
 * Preserve the original number text so JavaScript does not round large hash
 * values while converting the signature back to JSON.
 */
export const normaliseSourmashSignatureEnvelope = (
  signature: string,
  envelope: SourmashSignatureEnvelope
): string => {
  if (envelope !== 'object' && envelope !== 'array') {
    throw new Error(`Unsupported signature envelope: ${envelope}`);
  }

  const trimmedSignature = signature.trim();

  try {
    const parsedSignature = JSON.parse(trimmedSignature);
    const isArray = Array.isArray(parsedSignature);

    if (envelope === 'object') {
      if (!isArray) return trimmedSignature;
      if (parsedSignature.length !== 1) return signature;
      return trimmedSignature.slice(1, -1).trim();
    }

    return isArray ? trimmedSignature : `[${trimmedSignature}]`;
  } catch {
    return signature;
  }
};

/**
 * Preserve the Branchwater request contract: one signature object encoded as
 * a JSON string.
 */
export const normaliseBranchwaterSignature = (signature: string): string =>
  normaliseSourmashSignatureEnvelope(signature, 'object');

/** Preserve the Sourmash gather contract: an array-encoded signature file. */
export const normaliseSourmashGatherSignature = (signature: string): string =>
  normaliseSourmashSignatureEnvelope(signature, 'array');

const normaliseSourmashSignature = (
  signature: string,
  target: SourmashSignatureNormalisationTarget
): string => {
  if (target === 'branchwater') {
    return normaliseBranchwaterSignature(signature);
  }

  if (target === 'sourmash') {
    return normaliseSourmashGatherSignature(signature);
  }

  throw new Error(`Unsupported signature normalisation target: ${target}`);
};

export default normaliseSourmashSignature;
