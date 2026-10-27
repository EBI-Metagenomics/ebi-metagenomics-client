import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FeatureLocation } from 'components/Analysis/ContigViewer/V2ContigViewContext';

const LOCATION_PARAM = 'genomeBrowserLocation';
const LEGACY_PARAMS = ['contig_id', 'start', 'end', 'functional-annotation'];

export default function useGenomeBrowserLocation():
  | FeatureLocation
  | undefined {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const legacyRef = params.get('contig_id');
  const loc =
    params.get(LOCATION_PARAM) ||
    (legacyRef
      ? `${legacyRef}:${params.get('start')}-${params.get('end')}`
      : '');

  const feature = useMemo(() => {
    const match = /^(.*):(\d+)-(\d+)$/.exec(loc);
    if (!match || !match[1]) return undefined;
    const start = Number(match[2]);
    const end = Number(match[3]);
    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start < 1 ||
      end < start
    ) {
      return undefined;
    }
    return { refName: match[1], start, end };
  }, [loc]);

  useEffect(() => {
    if (!feature || !legacyRef) return;
    const next = new URLSearchParams(location.search);
    LEGACY_PARAMS.forEach((param) => next.delete(param));
    next.set(
      LOCATION_PARAM,
      `${feature.refName}:${feature.start}-${feature.end}`
    );
    navigate(
      { search: next.toString(), hash: location.hash },
      { replace: true }
    );
  }, [feature, legacyRef, location.search, location.hash, navigate]);

  return feature;
}
