import { useState, useEffect } from 'react';

const LoadingDots = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length === 3 ? '' : `${prevDots}.`));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return <span>{dots}</span>;
};

export default LoadingDots;
