import React from 'react';
import { useQueryParametersState } from 'hooks/useQueryParamState';

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
  const [queryParameters, setQueryParameters] = useQueryParametersState({
    [queryParameter]: defaultValue,
  });
  const value = queryParameters[queryParameter];

  return (
    <div className="vf-tabs mg-search-tabs">
      <ul className="vf-tabs__list">
        {tabs.map(({ label: Label, to }) => (
          <li className="vf-tabs__item" key={to}>
            <button
              type="button"
              className={`vf-tabs__link mg-button-as-tab ${
                to === value ? 'is-active' : ''
              }`}
              onClick={() =>
                setQueryParameters({
                  ...queryParameters,
                  [queryParameter]: to,
                })
              }
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
