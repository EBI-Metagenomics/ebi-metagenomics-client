import React, { useEffect } from 'react';
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
    [queryParameter]: '',
    page: 1,
  });
  useEffect(() => {
    if (queryParameters[queryParameter] === '') {
      setQueryParameters({
        ...queryParameters,
        [queryParameter]: defaultValue,
        page: 1,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParameters, queryParameter]);
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
                  page: 1,
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
