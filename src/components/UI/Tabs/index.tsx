import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Tab: React.FC = () => null;

type TabsProps = {
  tabs: Array<{
    label: string | React.ElementType;
    to: string;
  }>;
  preservedQueryParameters?: string[];
};
const Tabs: React.FC<TabsProps> = ({ tabs, preservedQueryParameters }) => {
  const location = useLocation();
  const queryParamString = useMemo(() => {
    if (!preservedQueryParameters) return '';
    const preserved = new URLSearchParams();
    const existing = new URLSearchParams(location.search);
    let anyPreserved = false;
    preservedQueryParameters.forEach((queryParam) => {
      if (existing.has(queryParam))
        preserved.append(queryParam, existing.get(queryParam));
      anyPreserved = true;
    });
    return anyPreserved ? `?${preserved.toString()}` : '';
  }, [preservedQueryParameters, location.search]);
  return (
    <div className="vf-tabs mg-search-tabs">
      <ul className="vf-tabs__list">
        {tabs.map(({ label: Label, to }) => (
          <li className="vf-tabs__item" key={to}>
            <Link
              className={`vf-tabs__link ${
                to === location.pathname ||
                (to.startsWith('#') && to === location.hash) ||
                (to === '#' && location.hash === '')
                  ? 'is-active'
                  : ''
              }`}
              to={to + queryParamString}
            >
              {typeof Label === 'string' ? Label : <Label />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tabs;
