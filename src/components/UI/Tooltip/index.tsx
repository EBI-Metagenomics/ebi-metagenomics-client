import React from 'react';
import Tippy from '@tippyjs/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'tippy.js/dist/tippy.css';

type TooltipProps = {
  content: React.ReactNode;
  children?: React.ReactNode;
};

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => (
  <Tippy content={content}>{children as React.ReactElement}</Tippy>
);
export default Tooltip;
