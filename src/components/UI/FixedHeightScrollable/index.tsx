import React from 'react';
import { useMeasure, useScroll } from 'react-use';

const topBorderStyle = {
  boxShadow: 'inset 0 15px 10px -10px var(--vf-color--neutral--200)',
  borderTop: '1px solid var(--vf-color--neutral--200)',
};

const bottomBorderStyle = {
  boxShadow: 'inset 0 -15px 10px -10px var(--vf-color--neutral--200)',
  borderBottom: '1px solid var(--vf-color--neutral--200)',
};

const bothBorderStyle = {
  boxShadow:
    'inset 0 -15px 10px -10px var(--vf-color--neutral--200), ' +
    'inset 0 15px 10px -10px var(--vf-color--neutral--200)',
};

const FixedHeightScrollable: React.FC<{
  heightPx?: number;
  className?: string;
}> = ({ children, heightPx, className }) => {
  const scrollRef = React.useRef(null);
  const { y } = useScroll(scrollRef);
  const [innerRef, { height }] = useMeasure();
  const isScrolledFromTop = y > 5;
  const canScrollToBottom = y + heightPx < height - 5;
  return (
    <div
      ref={scrollRef}
      className={className}
      style={{
        maxHeight: `${heightPx}px`,
        overflowY: 'scroll',
        ...(isScrolledFromTop && topBorderStyle),
        ...(canScrollToBottom && bottomBorderStyle),
        ...(canScrollToBottom && isScrolledFromTop && bothBorderStyle),
      }}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
};

export default FixedHeightScrollable;
