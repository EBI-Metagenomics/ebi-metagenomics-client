import React, { useState, useEffect, useContext } from 'react';
import useInterval from 'hooks/useInterval';
import { useMGnifyData } from 'hooks/useMGnifyData';

import UserContext from 'pages/Login/UserContext';

import './style.css';

const TIME_TO_CHECK_AGAIN = 1000 * 60;

const LoginMonitor: React.FC = () => {
  const [count, setCount] = useState(1);
  const { data, loading, rawResponse } = useMGnifyData(
    'utils/myaccounts',
    { count },
    { credentials: 'include' }
  );
  const { isAuthenticated, setUser } = useContext(UserContext);
  useInterval(() => {
    // Your custom logic here
    setCount(count + 1);
  }, TIME_TO_CHECK_AGAIN);
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (rawResponse?.status === 401) {
          setUser({ username: null, isAuthenticated: false });
        }
      } else if (rawResponse?.status === 200) {
        const id = data?.data?.[0]?.id || null;
        setUser({ username: id, isAuthenticated: id !== null });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading, rawResponse, setUser]);
  let backgroundColor = 'green';
  if (isAuthenticated) backgroundColor = 'green';
  if (loading) backgroundColor = 'yellow';
  return <div className="mg-monitor-light" style={{ backgroundColor }} />;
};

export default LoginMonitor;
