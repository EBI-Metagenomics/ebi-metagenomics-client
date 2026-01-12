// hooks/useReveal.ts
import { useEffect, useRef } from 'react';

export default function useReveal(className = 'is-revealed') {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    let observer: IntersectionObserver | null = null;

    if (node) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            node.classList.add(className);
            observer?.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(node);
    }

    // Always return a cleanup function to satisfy consistent-return
    return () => observer?.disconnect();
  }, [className]);

  return ref;
}
