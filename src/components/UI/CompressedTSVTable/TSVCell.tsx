import React from 'react';

import { findReferenceDatabaseMatches } from 'utils/tsv';

const HighlightedText: React.FC<{ text: string; searchTerm?: string }> = ({
  text,
  searchTerm = '',
}) => {
  const term = searchTerm.trim();
  if (!term) return <>{text}</>;

  const textLower = text.toLowerCase();
  const termLower = term.toLowerCase();
  const parts: React.ReactNode[] = [];
  let offset = 0;
  let matchIndex = textLower.indexOf(termLower);

  while (matchIndex >= 0) {
    if (matchIndex > offset) parts.push(text.slice(offset, matchIndex));
    const matchEnd = matchIndex + term.length;
    parts.push(
      <mark key={`${matchIndex}-${matchEnd}`}>
        {text.slice(matchIndex, matchEnd)}
      </mark>
    );
    offset = matchEnd;
    matchIndex = textLower.indexOf(termLower, offset);
  }

  if (offset < text.length) parts.push(text.slice(offset));
  return <>{parts}</>;
};

const TSVCell: React.FC<{ value: unknown; searchTerm?: string }> = ({
  value,
  searchTerm,
}) => {
  if (value === null || value === undefined) return null;

  const text = String(value);
  const references = findReferenceDatabaseMatches(text);
  if (!references.length) {
    return <HighlightedText text={text} searchTerm={searchTerm} />;
  }

  const content: React.ReactNode[] = [];
  let offset = 0;
  references.forEach((reference) => {
    if (reference.start > offset) {
      content.push(
        <HighlightedText
          key={`text-${offset}`}
          text={text.slice(offset, reference.start)}
          searchTerm={searchTerm}
        />
      );
    }
    content.push(
      <a
        key={`reference-${reference.start}`}
        href={reference.href}
        target="_blank"
        rel="noopener noreferrer"
        title={`View ${reference.text} in ${reference.name}`}
      >
        <HighlightedText text={reference.text} searchTerm={searchTerm} />
      </a>
    );
    offset = reference.end;
  });

  if (offset < text.length) {
    content.push(
      <HighlightedText
        key={`text-${offset}`}
        text={text.slice(offset)}
        searchTerm={searchTerm}
      />
    );
  }
  return <>{content}</>;
};

export default TSVCell;
