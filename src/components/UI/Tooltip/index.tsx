import React, { useCallback, useState } from 'react';
import Tippy from '@tippyjs/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'tippy.js/dist/tippy.css';
import './style.css';

type TooltipProps = {
  content: React.ReactNode;
  children?: React.ReactNode;
  interactive?: boolean;
};

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  interactive = false,
}) => {
  const child = children as React.ReactElement<{
    ref?: React.Ref<HTMLElement>;
  }>;
  const childRef = child.props.ref;
  const [reference, setReference] = useState<HTMLElement | null>(null);
  const attachReference = useCallback(
    (node: HTMLElement | null) => {
      setReference(node);
      if (typeof childRef === 'function') return childRef(node);
      if (childRef) childRef.current = node;
    },
    [childRef]
  );

  // Tippy's child cloning reads element.ref, which React 19 removed.
  return (
    <>
      {React.cloneElement(child, { ref: attachReference })}
      <Tippy
        content={content}
        interactive={interactive}
        reference={reference}
      />
    </>
  );
};
export default Tooltip;
