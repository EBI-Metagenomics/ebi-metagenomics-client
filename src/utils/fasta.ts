import axios from 'axios';

/** Return the first 500 characters of a plain or gzipped FASTA file. */
export const fetchFastaPreview = async (fastaUrl: string): Promise<string> => {
  try {
    if (new URL(fastaUrl).pathname.endsWith('.gz')) {
      const response = await fetch(fastaUrl);
      if (!response.ok || !response.body) return '';

      const stream =
        response.headers.get('Content-Encoding') === 'gzip'
          ? response.body
          : response.body.pipeThrough(new DecompressionStream('gzip'));
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let sequence = '';
      try {
        while (sequence.length < 500) {
          const { value, done } = await reader.read();
          if (done) break;
          sequence += decoder.decode(value, { stream: true });
        }
        return sequence.substring(0, 500);
      } finally {
        await reader.cancel();
      }
    }

    const headersConfig = {
      headers: {
        Range: 'bytes=0-499',
      },
    };

    const response = await axios.get(fastaUrl, headersConfig);
    const { data } = response;
    return data.substring(0, 500);
  } catch {
    return '';
  }
};
