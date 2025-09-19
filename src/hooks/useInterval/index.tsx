// From https://overreacted.io/making-setinterval-declarative-with-react-@/hooks/
import { useEffect, useRef } from 'react';

function useInterval(callback: () => void, delay: number): void {
  const savedCallback = useRef(callback);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect((): (() => void) => {
    function tick(): void {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
    return () => null;
  }, [delay]);
}
export default useInterval;
