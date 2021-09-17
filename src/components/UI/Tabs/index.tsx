import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Tab: React.FC = () => null;

type TabsProps = {
  tabs: Array<{
    label: string;
    to: string;
  }>;
};
const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const location = useLocation();

  return (
    <div className="vf-tabs mg-search-tabs">
      <ul className="vf-tabs__list">
        {tabs.map(({ label, to }) => (
          <li className="vf-tabs__item" key={label}>
            <Link
              className={`vf-tabs__link ${
                to === location.pathname ||
                (to.startsWith('#') && to === location.hash)
                  ? 'is-active'
                  : ''
              }`}
              to={to}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tabs;
