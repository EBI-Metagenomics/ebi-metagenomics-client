import React, { ReactChild, ReactChildren, useState } from 'react';
import './style.css';

const AccordionElement: React.FC<{
  title: string;
  children: ReactChild;
}> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <li
      className={`vf-tree__item ${
        isOpen ? 'vf-tree__item--selected | vf-tree__item--expanded' : ''
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="vf-button vf-button--link vf-tree__link"
        type="button"
      >
        {title}
        <span className="vf-button vf-tree__button">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M19.5,12a2.3,2.3,0,0,1-.78,1.729L7.568,23.54a1.847,
            1.847,0,0,1-2.439-2.773l9.752-8.579a.25.25,0,0,0,0-.376L5.129,
            3.233A1.847,1.847,0,0,1,7.568.46l11.148,9.808A2.31,2.31,0,0,1,19.5,12Z"
            />
          </svg>
        </span>
      </button>
      {isOpen && children}
    </li>
  );
};

export const AccordionContentPanel: React.FC<{
  children: ReactChild | ReactChild[];
}> = ({ children }) => {
  return <div className="accordion-content-panel">{children}</div>;
};

type AccordionListProps = {
  titles: string[];
  children: ReactChild | ReactChild[] | ReactChildren | ReactChildren[];
  nestedLevel?: number;
};
export const AccordionList: React.FC<AccordionListProps> = ({
  titles,
  nestedLevel,
  children,
}) => {
  return (
    <ul
      className={`vf-tree__list  vf-tree__list--${nestedLevel} ${
        nestedLevel > 1 ? 'vf-tree__list--additional' : ''
      } | vf-list `}
    >
      {titles.map((title, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <AccordionElement title={title} key={i}>
          {children[i]}
        </AccordionElement>
      ))}
    </ul>
  );
};

type AccordionProps = {
  titles: string[];
  children: ReactChild | ReactChild[] | ReactChildren | ReactChildren[];
};
const Accordion: React.FC<AccordionProps> = ({ titles, children }) => {
  return (
    <div className="vf-tree" aria-expanded="true">
      <div className="vf-tree__inner">
        <AccordionList titles={titles} nestedLevel={1}>
          {children}
        </AccordionList>
      </div>
    </div>
  );
};

export default Accordion;
