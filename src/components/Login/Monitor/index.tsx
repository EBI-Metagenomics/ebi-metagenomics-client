import React, { useState, useEffect, useContext } from 'react';
import useInterval from 'hooks/useInterval';
import useMGnifyData from 'hooks/data/useMGnifyData';

import UserContext, { UserDetails } from 'pages/Login/UserContext';

import './style.css';
import config from 'utils/config';
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
import { useToken } from 'hooks/useToken';

const TIME_TO_CHECK_AGAIN = 1000 * 60;
// const TIME_TO_CHECK_AGAIN = 1000;

const LoginMonitor: React.FC = () => {
  const [count, setCount] = useState(1);
  const [t, setToken] = useToken();
  // const { data, loading, isStale, rawResponse } = useMGnifyData(
  //   'utils/myaccounts',
  //   { count },
  //   { credentials: 'include' }
  // );
  // login(userRef.current.value, passwordRef.current.value);
  const { isAuthenticated, token, setUser, setDetails } =
    useContext(UserContext);
  useInterval(() => {
    setCount((c) => c + 1);
  }, TIME_TO_CHECK_AGAIN);
  useEffect(() => {
    const bearer = `Bearer ${token}`;

    axios
      .get(`${config.api}utils/myaccounts`, {
        headers: {
          Authorization: bearer,
        },
      })
      .then((response) => {
        console.log('response', response.data.data);
        const id = response.data.data?.[0]?.id || null;
        // setUser({ username: id, isAuthenticated: id !== null });
        setDetails(response.data.data as unknown as UserDetails);
        // setToken(token) as void;
      })
      .catch((err) => {
        setUser({ username: null, isAuthenticated: false, token: null });
        setDetails(null);
      });
    // console.log('rawResponse', rawResponse);
    // alert('monitoring');
    // setUser({ username: '12345', isAuthenticated: true, token });
    // if (!loading && !isStale) {
    //   // if (rawResponse?.status === 401) {
    //   //   setUser({ username: null, isAuthenticated: false, token: null });
    //   //   setDetails(null);
    //   // }
    //   // if (rawResponse?.status === 200) {
    //   //   const id = data?.data?.[0]?.id || null;
    //   //   // setUser({ username: id, isAuthenticated: id !== null });
    //   //   setDetails(data?.data as unknown as UserDetails);
    //   // }
    //
    //   // axios
    //   //   .post(`${config.api}utils/token/verify`)
    //   //   .then((response) => {
    //   //     console.log('response', response.data.data);
    //   //     const receivedToken = response.data.data.token;
    //   //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   //     // @ts-ignore
    //   //     setToken(receivedToken) as unknown as void;
    //   //   })
    //   //   .catch((err) => {
    //   //     setUser({ username: null, isAuthenticated: false, token: null });
    //   //     setDetails(null);
    //   //   });
    //
    //
    // }
    // }, [data, loading, rawResponse, setUser, setDetails, isStale]);
  }, [setUser, setDetails]);
  useEffect(() => {
    setCount((c) => c + 1);
  }, [isAuthenticated]);
  let backgroundColor = 'green';
  if (isAuthenticated) backgroundColor = 'green';
  // if (loading) backgroundColor = 'yellow';
  return <div className="mg-monitor-light" style={{ backgroundColor }} />;
};

export default LoginMonitor;
