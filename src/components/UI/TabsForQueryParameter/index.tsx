import React, { useEffect } from 'react';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

type TabsProps = {
  tabs: Array<{
    label: string | React.ElementType;
    to: string;
  }>;
  queryParameter: string;
  defaultValue: string;
};
const TabsForQueryParameter: React.FC<TabsProps> = ({
  tabs,
  queryParameter,
  defaultValue,
}) => {
  const [tabQp, setTabQp] = useQueryParamState(queryParameter, defaultValue);
  const [, setPage] = useQueryParamState('page', 1, Number);

  useEffect(() => {
    if (tabQp === '') {
      setTabQp(defaultValue);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabQp, queryParameter]);

  return (
    <div className="vf-tabs mg-search-tabs">
      <ul className="vf-tabs__list">
        {tabs.map(({ label: Label, to }) => (
          <li className="vf-tabs__item" key={to}>
            <button
              type="button"
              className={`vf-tabs__link mg-button-as-tab ${
                to === tabQp ? 'is-active' : ''
              }`}
              onClick={() => {
                setTabQp(to);
                setPage(1);
              }}
            >
              {typeof Label === 'string' ? Label : <Label />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabsForQueryParameter;
