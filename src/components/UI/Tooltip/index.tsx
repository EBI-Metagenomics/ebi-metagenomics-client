import React from 'react';
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
}) => (
  <Tippy content={content} interactive={interactive}>
    {children as React.ReactElement}
  </Tippy>
);
export default Tooltip;
