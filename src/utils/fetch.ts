export class FetchError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
  }
}

export async function fetchWithCheck(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new FetchError(
      `HTTP error! Status: ${response.status}`,
      response.status
    );
  }

  return response;
}

export async function fetchText(
  url: string,
  options?: RequestInit,
  emptyErrorMessage: string = 'The data file is empty or missing.'
): Promise<string> {
  const response = await fetchWithCheck(url, options);
  const text = await response.text();

  if (!text || text.trim().length === 0) {
    throw new FetchError(emptyErrorMessage, response.status);
  }

  return text;
}

export async function fetchJson<T = any>(
  url: string,
  options?: RequestInit,
  emptyErrorMessage: string = 'The data file is empty or missing.',
  invalidJsonErrorMessage: string = 'Failed to parse data: Invalid JSON format'
): Promise<T> {
  const text = await fetchText(url, options, emptyErrorMessage);
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    console.log(e);
    throw new FetchError(invalidJsonErrorMessage);
  }
}

export async function fetchBlob(
  url: string,
  options?: RequestInit,
  emptyErrorMessage: string = 'The data file is empty or missing.'
): Promise<Blob> {
  const response = await fetchWithCheck(url, options);
  const blob = await response.blob();

  if (blob.size === 0) {
    throw new FetchError(emptyErrorMessage, response.status);
  }

  return blob;
}

export async function getRemoteFileSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (response.ok && contentLength > 0) return contentLength;
  } catch {
    // Some file servers do not support HEAD; try a minimal range request.
  }

  const controller = new AbortController();
  try {
    const response = await fetch(url, {
      headers: { Range: 'bytes=0-0' },
      signal: controller.signal,
    });
    const contentRange = response.headers.get('content-range');
    const contentLength = Number(
      contentRange?.split('/')[1] || response.headers.get('content-length') || 0
    );
    if (response.status !== 206) controller.abort();
    return (response.status === 200 || response.status === 206) &&
      contentLength > 0
      ? contentLength
      : 0;
  } catch {
    return 0;
  }
}
