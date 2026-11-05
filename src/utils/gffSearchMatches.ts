import { Contig, db } from './locallyIndexedGff';
import { searchRegExp } from './textSearch';

export type FeatureSearchMatch = {
  text: string;
  textOffset: number;
  start: number;
  end: number;
};

export type FeatureMatchCursor = { textStart: number; featureIndex: number };
export type FeatureMatchPage = {
  matches: FeatureSearchMatch[];
  next?: FeatureMatchCursor;
};

export function findFirstMatchingAnnotationBlock(
  annotationText: string,
  rawTerm: string,
  wholeWord = false
): string | undefined {
  const match =
    searchRegExp(rawTerm, true)?.exec(annotationText) ??
    searchRegExp(rawTerm, wholeWord)?.exec(annotationText);
  if (!match) return undefined;
  const start = annotationText.lastIndexOf(';', match.index - 1) + 1;
  const separator = annotationText.indexOf(';', match.index);
  return annotationText
    .slice(start, separator < 0 ? undefined : separator + 1)
    .trim();
}

// Read one coordinate batch at a time. Never materialize every matching feature.
export async function getFeatureMatchPage(
  contig: Pick<Contig, 'contigName' | 'annotationText'>,
  term: string,
  wholeWord: boolean,
  cursor?: FeatureMatchCursor,
  limit = 10,
  signal?: AbortSignal
): Promise<FeatureMatchPage> {
  const matches: FeatureSearchMatch[] = [];
  let textStart = cursor?.textStart ?? 0;
  let featureIndex = cursor?.featureIndex ?? 0;
  while (!signal?.aborted) {
    const batch = await db.coordinates
      .where('[contigName+textStart]')
      .between(
        [contig.contigName, textStart],
        [contig.contigName, Infinity],
        true,
        true
      )
      .first();
    if (!batch) break;
    const { spans } = batch;
    for (let i = featureIndex; i < spans.length; i += 3) {
      if (signal?.aborted) return { matches: [] };
      const localStart = i === 0 ? 0 : spans[i - 3];
      const attrs = contig.annotationText.slice(
        batch.textStart + localStart,
        batch.textStart + spans[i]
      );
      const text = findFirstMatchingAnnotationBlock(attrs, term, wholeWord);
      if (!text) continue;
      if (matches.length === limit) {
        return {
          matches,
          next: { textStart: batch.textStart, featureIndex: i },
        };
      }
      matches.push({
        text,
        textOffset: batch.textStart + localStart,
        start: spans[i + 1],
        end: spans[i + 2],
      });
    }
    textStart = batch.textStart + spans[spans.length - 3];
    featureIndex = 0;
  }
  return { matches };
}
