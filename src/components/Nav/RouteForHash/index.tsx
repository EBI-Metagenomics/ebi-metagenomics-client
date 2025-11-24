import React, { useEffect, useRef } from 'react';
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
  const { hash: currentHash } = useLocation();
  const navigate = useNavigate();

  // Normalize the target hash without using nested ternaries for clarity
  let targetHash = '';
  if (hash) {
    if (hash.startsWith('#')) {
      targetHash = hash;
    } else {
      targetHash = `#${hash}`;
    }
  }
  const didReplaceRef = useRef(false);

  useEffect(() => {
    if (!isDefault) return;
    if (didReplaceRef.current) return;

    if (currentHash === '' && targetHash !== '') {
      didReplaceRef.current = true;
      navigate({ hash: targetHash }, { replace: true });
    }
  }, [currentHash, targetHash, isDefault, navigate]);

  if (currentHash === targetHash) {
    return <div id={`tab-${targetHash.slice(1) || 'default'}`}>{children}</div>;
  }
  return null;
};

export default RouteForHash;
