import React from 'react';
import Tooltip from 'components/UI/Tooltip';

const TruncatedText: React.FC<{
  maxLength?: number;
  text: string;
  withTooltip?: boolean;
}> = ({ text, maxLength = 250, withTooltip = false }) => {
  const isTruncated = text.length >= maxLength;
  const truncated = (
    <>
      {text.substring(0, maxLength)}
      {isTruncated && '...'}
    </>
  );
  if (withTooltip && isTruncated)
    return (
      <Tooltip content={text}>
        <span>{truncated}</span>
      </Tooltip>
    );
  return truncated;
};

export default TruncatedText;
