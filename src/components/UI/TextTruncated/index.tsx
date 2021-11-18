import React from 'react';

const TruncatedText: React.FC<{ maxLength?: number; text: string }> = ({
  text,
  maxLength = 250,
}) => (
  <>
    {text.substring(0, maxLength)}
    {text.length >= maxLength && '...'}
  </>
);

export default TruncatedText;
