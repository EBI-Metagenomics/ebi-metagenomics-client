import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

type PropsType = {
  hash: string;
  isDefault?: boolean;
};
const RouteForHash: React.FC<PropsType> = ({
  hash,
  isDefault = false,
  children,
}) => {
  const location = useLocation();
  const history = useHistory();
  if (location.hash === '' && isDefault) {
    history.replace(hash);
  }

  if (location.hash === hash) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }
  return null;
};

export default RouteForHash;
