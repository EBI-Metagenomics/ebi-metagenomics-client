import React, { useMemo } from 'react';
import { Link, To, useLocation } from 'react-router-dom';

type TabsProps = {
  tabs: Array<{
    label: string | React.ElementType;
    to: string;
  }>;
  preservedQueryParameters?: string[];
};
const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const { pathname, hash } = useLocation();

  return (
    <div className="vf-tabs mg-search-tabs">
      <ul className="vf-tabs__list">
        {tabs.map(({ label: Label, to }) => (
          <li className="vf-tabs__item" key={to}>
            <Link
              className={`vf-tabs__link ${
                to === pathname ||
                (to.startsWith('#') && to === hash) ||
                (to === '#' && hash === '')
                  ? 'is-active'
                  : ''
              }`}
              to={to}
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

type RouteTabProps = {
  tabs: Array<{
    label: string | React.ElementType;
    to: To;
  }>;
  preservedQueryParameters?: string[];
};

export const RouteTabs: React.FC<RouteTabProps> = ({
  tabs,
  preservedQueryParameters,
}) => {
  const { search, pathname } = useLocation();

  const queryParamString = useMemo(() => {
    if (!preservedQueryParameters) return '';
    const preserved = new URLSearchParams();
    const existing = new URLSearchParams(search);
    let anyPreserved = false;
    preservedQueryParameters.forEach((queryParam) => {
      if (existing.has(queryParam)) {
        preserved.append(queryParam, existing.get(queryParam)!);
        anyPreserved = true;
      }
    });
    return anyPreserved ? `?${preserved.toString()}` : '';
  }, [preservedQueryParameters, search]);

  return (
    <div className="vf-tabs mg-search-tabs">
      <ul className="vf-tabs__list">
        {tabs.map(({ label: Label, to }) => {
          // keep string `to` as a string to avoid new object identity each render
          const toProp =
            typeof to === 'string'
              ? to + queryParamString
              : { ...to, search: (to as any).search ?? queryParamString };

          const isActive =
            (typeof to === 'string' && pathname.endsWith(to)) ||
            (typeof to !== 'string' &&
              to.pathname &&
              pathname.endsWith(to.pathname));

          return (
            <li
              className="vf-tabs__item"
              key={typeof to === 'string' ? to : to.pathname ?? ''}
            >
              <Link
                className={`vf-tabs__link ${isActive ? 'is-active' : ''}`}
                to={toProp}
              >
                {typeof Label === 'string' ? Label : <Label />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
