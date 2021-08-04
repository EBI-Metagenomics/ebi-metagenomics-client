import React, { useEffect, useContext } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import SearchQueryContext from 'pages/TextSearch/SearchQueryContext';

const tabs = [
  { label: 'Studies', to: '/search/studies' },
  { label: 'Samples', to: '/search/samples' },
  { label: 'Analyses', to: '/search/analyses' },
];

const SearchTabs: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { searchData } = useContext(SearchQueryContext);

  useEffect(() => {
    if (!tabs.some(({ to }) => to === location.pathname)) {
      history.replace({
        ...location,
        pathname: tabs[0].to,
      });
    }
  }, [location, history]);
  return (
    <div className="vf-tabs">
      <ul className="vf-tabs__list">
        {tabs.map(({ label, to }) => (
          <li className="vf-tabs__item" key={label}>
            <Link
              className={`vf-tabs__link ${
                to === location.pathname ? 'is-active' : ''
              }`}
              to={to}
            >
              {label}
              <span className="mg-number">
                {searchData?.[to]?.data?.hitCount || ''}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchTabs;
