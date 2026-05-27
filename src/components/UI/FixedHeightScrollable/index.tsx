import React from 'react';
import { useMeasure, useScroll } from 'react-use';

const FixedHeightScrollable: React.FC<{
  heightPx: number;
  className?: string;
  wrapperClassName?: string;
}> = ({ children, heightPx, className, wrapperClassName }) => {
  const scrollRef = React.useRef(null);
  const { y } = useScroll(scrollRef);
  const [innerRef, { height }] = useMeasure<HTMLDivElement>();
  const isScrolledFromTop = y > 5;
  const canScrollToBottom = y + heightPx < height - 5;
  return (
    <div
      className={`${wrapperClassName} fixed-height-scrollable__wrapper`}
      style={{ position: 'relative', maxHeight: `${heightPx}px` }}
    >
      <div
        ref={scrollRef}
        className={`${className} fixed-height-scrollable__outer`}
        style={{
          maxHeight: `${heightPx}px`,
          overflowY: 'scroll',
        }}
      >
        <div ref={innerRef} className="fixed-height-scrollable__inner">
          {children}
        </div>
      </div>
      {isScrolledFromTop && (
        <div
          className="fixed-height-scrollable__shadow fixed-height-scrollable__shadow--top"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '15px',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: 'inset 0 15px 10px -10px rgba(0,0,0,0.2)',
            borderTop: '1px solid var(--vf-color--neutral--200)',
          }}
        />
      )}
      {canScrollToBottom && (
        <div
          className="fixed-height-scrollable__shadow fixed-height-scrollable__shadow--bottom"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '15px',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: 'inset 0 -15px 10px -10px rgba(0,0,0,0.2)',
            borderBottom: '1px solid var(--vf-color--neutral--200)',
          }}
        />
      )}
    </div>
  );
};

export default FixedHeightScrollable;
