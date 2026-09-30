/**
 * Ensure a Sourmash signature uses the API's array-based format without
 * parsing and re-serialising its 64-bit hash values through JavaScript.
 */
const normaliseSourmashSignature = (signature: string): string => {
  const trimmedSignature = signature.trim();

  try {
    const parsedSignature = JSON.parse(trimmedSignature);

    // Keep the original JSON text so integers larger than Number.MAX_SAFE_INTEGER
    // retain the exact representation produced by Sourmash's WASM serializer.
    if (Array.isArray(parsedSignature)) {
      return trimmedSignature;
    }

    return `[${trimmedSignature}]`;
  } catch {
    // Preserve unexpected input so the API can return the validation error.
    return signature;
  }
};

export default normaliseSourmashSignature;
