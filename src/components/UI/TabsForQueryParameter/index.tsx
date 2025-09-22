import React, { useEffect } from 'react';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';

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
  const [tabQp, setTabQp] = useQueryParamState(queryParameter);

  useEffect(() => {
    if (!tabQp || tabQp === '') {
      setTabQp(defaultValue);
    }
  }, [tabQp, queryParameter]);

  const tab = tabQp ?? defaultValue;

  return (
    <div className="vf-tabs mg-search-tabs">
      <ul className="vf-tabs__list">
        {tabs.map(({ label: Label, to }) => (
          <li className="vf-tabs__item" key={to}>
            <button
              type="button"
              className={`vf-tabs__link mg-button-as-tab ${
                to === tab ? 'is-active' : ''
              }`}
              onClick={() => {
                setTabQp(to);
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
