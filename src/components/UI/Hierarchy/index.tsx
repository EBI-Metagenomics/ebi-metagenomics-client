import React, { useState, useEffect } from 'react';
import './style.css';

const ANIMATION_TIME = 400;

export type Node = {
  name: string;
  countgen?: number;
  type?: string;
  children?: Node[];
  [key: string]: unknown;
};

interface HierarchyNodeProps {
  tree: Node;
  depth?: number;
  shouldExpand?: boolean;
  collapsing?: boolean;
  getLabel?: (node: Node) => string | React.ReactElement;
  triggerExpandAll?: boolean;
  triggerCollapseAll?: boolean;
}
const HierarchyNode: React.FC<HierarchyNodeProps> = ({
  tree,
  depth = 0,
  shouldExpand = true,
  collapsing = false,
  getLabel = (node) => node.name,
  triggerExpandAll = false,
  triggerCollapseAll = false,
}) => {
  const [displayChildren, setDisplayChildren] = useState(shouldExpand);
  const [triggerExpandAllChildren, setTriggerExpandAllChildren] =
    useState(triggerExpandAll);
  const [show, setShow] = useState(false);
  const [hideChildren, setHideChildren] = useState(false);
  useEffect(() => setShow(true), []);
  useEffect(() => {
    if (hideChildren) {
      setTimeout(() => setDisplayChildren(false), ANIMATION_TIME);
    }
  }, [hideChildren]);
  useEffect(() => {
    if (triggerExpandAll) {
      setDisplayChildren(true);
      setTriggerExpandAllChildren(true);
      setTimeout(() => setTriggerExpandAllChildren(false), ANIMATION_TIME);
    }
  }, [triggerExpandAll]);
  useEffect(() => {
    if (triggerCollapseAll) {
      setDisplayChildren(false);
    }
  }, [triggerCollapseAll]);
  const handleExpanderClick = (): void => {
    setHideChildren(displayChildren);
    if (!displayChildren) setDisplayChildren(true);
  };
  return (
    <div
      id="hierarchy-node"
      style={{
        marginLeft: `${depth * 0.5}rem`,
      }}
    >
      <div
        className={`mg-hierarchy-selector ${show && !collapsing ? 'show' : ''}`}
      >
        {tree.children?.length ? (
          <button
            type="button"
            className="mg-expander"
            onClick={handleExpanderClick}
          >
            {displayChildren ? '▾' : '▸'}
          </button>
        ) : (
          <span className="mg-hierarchy-spacer" />
        )}
        <div>
          <span className="mg-hierarchy-label">
            {getLabel(tree)}{' '}
            {tree.countgen && (
              <span className="mg-number">{tree.countgen}</span>
            )}
          </span>
        </div>
      </div>
      {tree.children &&
        tree.children.length > 0 &&
        displayChildren &&
        tree.children.map((child) => (
          <HierarchyNode
            key={child.name}
            tree={child}
            depth={depth + 1}
            shouldExpand={tree.countgen === 1 && child.countgen === 1}
            getLabel={getLabel}
            collapsing={hideChildren}
            triggerExpandAll={triggerExpandAllChildren}
          />
        ))}
    </div>
  );
};

export default HierarchyNode;
