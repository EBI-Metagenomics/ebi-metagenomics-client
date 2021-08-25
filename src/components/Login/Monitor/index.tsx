import React, { useState, useEffect, useContext } from 'react';
import useInterval from 'hooks/useInterval';
import { useMGnifyData } from 'hooks/useMGnifyData';

import UserContext, { UserDetails } from 'pages/Login/UserContext';

import './style.css';

const TIME_TO_CHECK_AGAIN = 1000 * 60;

const LoginMonitor: React.FC = () => {
  const [count, setCount] = useState(1);
  const { data, loading, isStale, rawResponse } = useMGnifyData(
    'utils/myaccounts',
    { count },
    { credentials: 'include' }
  );
  const { isAuthenticated, setUser, setDetails } = useContext(UserContext);
  useInterval(() => {
    // Your custom logic here
    setCount(count + 1);
  }, TIME_TO_CHECK_AGAIN);
  useEffect(() => {
    if (!loading && !isStale) {
      if (rawResponse?.status === 401) {
        setUser({ username: null, isAuthenticated: false });
        setDetails(null);
      }
      if (rawResponse?.status === 200) {
        const id = data?.data?.[0]?.id || null;
        setUser({ username: id, isAuthenticated: id !== null });
        setDetails(data?.data as unknown as UserDetails);
      }
    }
  }, [data, loading, rawResponse, setUser, isStale]);
  useEffect(() => {
    setCount(count + 1);
  }, [isAuthenticated]);
  let backgroundColor = 'green';
  if (isAuthenticated) backgroundColor = 'green';
  if (loading) backgroundColor = 'yellow';
  return <div className="mg-monitor-light" style={{ backgroundColor }} />;
};

export default LoginMonitor;
