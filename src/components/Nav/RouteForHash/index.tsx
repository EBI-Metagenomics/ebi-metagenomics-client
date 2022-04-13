import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  useEffect(() => {
    if (location.hash === '' && hash !== '' && isDefault) {
      navigate(hash, { replace: true });
    }
  });

  if (location.hash === hash) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <div id={`tab-${hash.slice(1)}`}>{children}</div>;
  }
  return null;
};

export default RouteForHash;
