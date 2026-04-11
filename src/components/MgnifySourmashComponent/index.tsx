import React, { useEffect, useMemo, useRef } from 'react';

declare global {
  interface Window {
    __mgnifySourmashLoader?: Promise<void>;
  }
}

type Props = {
  showDirectoryCheckbox?: boolean;
  showSignatures?: boolean;

  num?: number;
  ksize?: number;
  scaled?: number;
  seed?: number;
  trackAbundance?: boolean;

  className?: string;
  style?: React.CSSProperties;

  onSketched?: (signatureJson: string) => void;
};

function loadScriptOnce(src: string): Promise<void> {
  if (window.__mgnifySourmashLoader) return window.__mgnifySourmashLoader;

  window.__mgnifySourmashLoader = new Promise<void>((resolve, reject) => {
    if (
      document.querySelector(`script[data-mgnify-sourmash="1"][src="${src}"]`)
    ) {
      resolve();
      return;
    }

    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    s.async = true;
    s.dataset.mgnifySourmash = '1';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

  return window.__mgnifySourmashLoader;
}

export default function MGnifySourmashComponent({
  showDirectoryCheckbox = true,
  showSignatures = true,
  num,
  ksize,
  scaled,
  seed,
  trackAbundance,
  className,
  style,
  onSketched,
}: Props) {
  const elRef = useRef<HTMLElement | null>(null);

  // ✅ MUST be the main component JS, NOT worker JS
  // If the files are in /public/mgnify-component/, then at runtime you load:
  //   /mgnify-component/mgnify-sourmash-component.js
  const scriptSrc = useMemo(
    () => `public/mgnify-component/mgnify-sourmash-component.js`,
    []
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await loadScriptOnce(scriptSrc);
      if (cancelled) return;

      const el = elRef.current as any;
      if (!el) return;

      // ✅ set LitElement properties
      el.show_directory_checkbox = !!showDirectoryCheckbox;
      el.show_signatures = !!showSignatures;

      if (typeof num === 'number') el.num = num;
      if (typeof ksize === 'number') el.ksize = ksize;
      if (typeof scaled === 'number') el.scaled = scaled;
      if (typeof seed === 'number') el.seed = seed;
      if (typeof trackAbundance === 'boolean')
        el.track_abundance = trackAbundance;

      // ✅ listen for sketched output on the element itself
      const handler = (evt: any) => {
        const sig = evt?.detail?.signature ?? evt?.detail;
        if (typeof sig === 'string') {
          onSketched?.(sig);
        }
      };

      el.addEventListener('sketched', handler);

      // cleanup for this mount
      return () => {
        el.removeEventListener('sketched', handler);
      };
    })().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [
    scriptSrc,
    showDirectoryCheckbox,
    showSignatures,
    num,
    ksize,
    scaled,
    seed,
    trackAbundance,
    onSketched,
  ]);

  return (
    <mgnify-sourmash-component
      ref={elRef as any}
      ksize={21}
      class={className}
      style={style as any}
    />
  );
}
