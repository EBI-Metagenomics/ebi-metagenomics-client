import React from 'react';
import { createViewState } from '@jbrowse/react-linear-genome-view2';
import { Download } from 'interfaces/index';
import { BGZipService } from 'components/Analysis/BgZipService';

type LGVViewState = ReturnType<typeof createViewState>;

type LGVContextValue = {
  viewState: LGVViewState | null;
  navTo: (loc: string) => void;
  ready: boolean;
};

const LGVContext = React.createContext<LGVContextValue | null>(null);

export function useLGV() {
  const ctx = React.useContext(LGVContext);
  if (!ctx) throw new Error('useLGV must be used within <LGVProvider>');
  return ctx;
}

export function LGVProvider({
  fasta,
  gff,
  initialLoc = 'chr1:1-50000',
  children,
}: {
  fasta: Download;
  gff: Download;
  initialLoc?: string;
  children: React.ReactNode;
}) {
  const assemblyKey = React.useMemo(() => fasta.alias, [fasta]);

  const viewState = React.useMemo(
    () =>
      createViewState({
        assembly: {
          name: fasta.alias,
          sequence: {
            type: 'ReferenceSequenceTrack',
            trackId: 'refseq',
            adapter: {
              type: 'BgzipFastaAdapter',
              uri: fasta.url,
            },
          },
        },
        tracks: [],
        location: initialLoc,
      }),
    [fasta.alias, fasta.url, initialLoc]
  );

  const view = (viewState as any)?.session?.view;
  const ready = Boolean(view && typeof view.navToLocString === 'function');

  const navTo = React.useCallback(
    (refName: string) => {
      if (!ready || !assemblyKey) return;
      (async () => {
        try {
          const asm = await (
            viewState as any
          )?.assemblyManager?.waitForAssembly?.(assemblyKey);
          if (!asm) return;

          const canonical = asm.getCanonicalRefName?.(refName) ?? refName;
          const region =
            asm.regions?.find((r: any) => r.refName === canonical) ??
            asm.regions?.find((r: any) => r.refName === refName);

          if (!region) {
            console.warn('No region found for refName', {
              refName,
              canonical,
              assemblyKey,
            });
            return;
          }

          // Ensure the view knows which regions to display
          view.setDisplayedRegions?.([region]);

          // Jump to the ref; default to the full region span if needed
          const start = Math.max(1, (region.start ?? 0) + 1);
          const end = region.end ?? start + 1000;
          if (typeof view.navToLocString === 'function') {
            view.navToLocString(`${canonical}:${start}-${end}`);
          } else if (typeof view.navTo === 'function') {
            view.navTo({ assemblyName: assemblyKey, refName: canonical });
          }
        } catch (e) {
          console.warn('navTo failed', { refName, assemblyKey, error: e });
        }
      })();
    },
    [ready, assemblyKey, viewState, view]
  );

  // Initialize once: wait for assembly, set displayed regions to the first ref, hide header
  React.useEffect(() => {
    if (!ready || !assemblyKey) return;
    let cancelled = false;

    (async () => {
      try {
        const asm = await (
          viewState as any
        )?.assemblyManager?.waitForAssembly?.(assemblyKey);
        if (cancelled || !asm) return;

        const firstRef = asm.allRefNames?.[0];
        if (firstRef) {
          const canonical = asm.getCanonicalRefName?.(firstRef) ?? firstRef;
          const region =
            asm.regions?.find((r: any) => r.refName === canonical) ??
            asm.regions?.find((r: any) => r.refName === firstRef);

          if (region) {
            view.setDisplayedRegions?.([region]);
            const start = Math.max(1, (region.start ?? 0) + 1);
            const end = region.end ?? start + 1000;
            view.navToLocString?.(`${canonical}:${start}-${end}`);
          } else {
            console.warn('Failed to find region for firstRef', {
              firstRef,
              canonical,
              assemblyKey,
            });
          }
        } else {
          console.warn('Assembly has no refNames', { assemblyKey });
        }

        // Hide header to remove assembly/region selector
        (viewState as any)?.session?.view?.setHideHeader?.(true);
      } catch (e) {
        console.warn('Failed to initialize assembly selection', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, assemblyKey, viewState, view]);

  React.useEffect(() => {
    if (!ready || !gff) return;
    const session = (viewState as any)?.session;
    if (!session) return;
    // session.view.setHideHeader(true)
    const trackExists = !!session.getTrack?.(gff.alias);

    const conf = {
      type: 'FeatureTrack',
      trackId: gff.alias,
      name: gff.alias,
      assemblyNames: [fasta.alias],
      adapter: {
        type: 'Gff3TabixAdapter',
        gffGzLocation: { uri: gff.url },
        index: {
          location: {
            uri: BGZipService.getIndexFileUrl(gff, 'csi'),
          },
          indexType: 'CSI',
        },
      },
      displays: [
        {
          type: 'LinearBasicDisplay',
          displayId: `${gff.alias}-LinearBasicDisplay`,
        },
      ],
    };

    if (!trackExists) {
      session.addTrackConf?.(conf);
    }
    session.view.showTrack(gff.alias);
  }, [ready, gff, fasta.alias, viewState]);

  const value = React.useMemo<LGVContextValue>(
    () => ({ viewState, ready, navTo }),
    [viewState, ready, navTo]
  );

  return <LGVContext.Provider value={value}>{children}</LGVContext.Provider>;
}
