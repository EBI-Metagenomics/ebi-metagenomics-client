import { useMemo, useState, useEffect } from 'react';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';
import {
  processBranchwaterResults,
  type VisualizationData,
  type MapSample,
} from '@/utils/branchwater';

export type BranchwaterFilters = {
  acc: string;
  assay_type: string;
  bioproject: string;
  collection_date_sam: string;
  containment: string;
  geo_loc_name_country_calc: string;
  organism: string;
  query?: string;
  cani?: string;
};

export type UseBranchwaterResultsArgs<T extends Record<string, unknown>> = {
  items: T[];
  namespace: string; // must end with a hyphen (e.g. "genome-branchwater-")
  pageSize?: number;
  filters: BranchwaterFilters;
};

export type UseBranchwaterResultsReturn<T> = {
  page: number;
  pageSize: number;
  order: string; // e.g. "-cANI" | "containment"
  filteredResults: T[];
  sortedResults: T[];
  paginatedResults: T[];
  total: number;
  visualizationData: VisualizationData | null;
  mapSamples: MapSample[];
  countryCounts: Record<string, number>;
};

function toLowerSafe(v: unknown): string {
  if (v == null) return '';
  try {
    return String(v).toLowerCase();
  } catch {
    return '';
  }
}

function compareValues(a: unknown, b: unknown): number {
  // Numeric if both are finite numbers
  const toFiniteNumber = (v: unknown): number | null => {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };
  const aNum = toFiniteNumber(a);
  const bNum = toFiniteNumber(b);
  if (aNum !== null && bNum !== null) {
    if (aNum < bNum) return -1;
    if (aNum > bNum) return 1;
    return 0;
  }
  const aStr = toLowerSafe(a);
  const bStr = toLowerSafe(b);
  if (aStr < bStr) return -1;
  if (aStr > bStr) return 1;
  return 0;
}

export default function useBranchwaterResults<
  T extends Record<string, unknown>
>({
  items,
  namespace,
  pageSize = 25,
  filters,
}: UseBranchwaterResultsArgs<T>): UseBranchwaterResultsReturn<T> {
  const [pageQP] = useQueryParamState(`${namespace}page`, 1, Number);
  const [orderQP] = useQueryParamState(`${namespace}order`, '');

  const filteredResults = useMemo(() => {
    const f = filters || ({} as BranchwaterFilters);
    const globalQuery = (f.query || '').toString().trim().toLowerCase();

    return (items || []).filter((it) => {
      // Apply global text query across common fields (if provided)
      if (globalQuery) {
        const haystack = [
          it.acc,
          it.assay_type,
          it.bioproject,
          it.collection_date_sam,
          it.geo_loc_name_country_calc,
          it.organism,
        ]
          .map((value) => (value == null ? '' : String(value).toLowerCase()))
          .join(' ');
        if (!haystack.includes(globalQuery)) return false;
      }

      // Apply per-field contains filters (case-insensitive)
      const entries: Array<[keyof BranchwaterFilters, string]> = [
        ['acc', f.acc],
        ['assay_type', f.assay_type],
        ['bioproject', f.bioproject],
        ['collection_date_sam', f.collection_date_sam],
        ['containment', f.containment],
        ['geo_loc_name_country_calc', f.geo_loc_name_country_calc],
        ['organism', f.organism],
      ];
      let ok = true;
      entries.forEach(([key, val]) => {
        if (!ok) return; // short-circuit further checks
        if (!val) return;
        const needle = val.toLowerCase();
        const hay = toLowerSafe((it as Record<string, unknown>)[key]);
        if (!hay.includes(needle)) ok = false;
      });
      if (!ok) return false;

      // Apply cANI numeric range filter
      if (f.cani) {
        const [minStr, maxStr] = f.cani.split(',');
        const min = Number(minStr);
        const max = Number(maxStr);

        if (!Number.isNaN(min) && !Number.isNaN(max)) {
          const val = it.cANI;
          const num = typeof val === 'number' ? val : Number(val);

          if (Number.isNaN(num)) return false;

          const EPSILON = 0.0001;
          if (num < min - EPSILON || num > max + EPSILON) {
            return false;
          }
        }
      }

      return true;
    });
  }, [items, filters]);

  const sortedResults = useMemo(() => {
    const order = orderQP || '';
    if (!order) return filteredResults;
    const desc = order.startsWith('-');
    const field = order.replace(/^-/, '');
    const arr = [...filteredResults];
    arr.sort((a, b) => {
      const cmp = compareValues(
        (a as Record<string, unknown>)[field],
        (b as Record<string, unknown>)[field]
      );
      return desc ? -cmp : cmp;
    });
    return arr;
  }, [filteredResults, orderQP]);

  const paginatedResults = useMemo(() => {
    const pageIndex = Math.max(0, (pageQP || 1) - 1);
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return sortedResults.slice(start, end);
  }, [sortedResults, pageQP, pageSize]);

  const [visualizationData, setVisualizationData] =
    useState<VisualizationData | null>(null);
  const [mapSamples, setMapSamples] = useState<MapSample[]>([]);
  const [countryCounts, setCountryCounts] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    if (items.length > 0) {
      const {
        vizData,
        mapData,
        countryCounts: counts,
      } = processBranchwaterResults(filteredResults as any);
      setVisualizationData(vizData);
      setMapSamples(mapData);
      setCountryCounts(counts);
    } else {
      setVisualizationData(null);
      setMapSamples([]);
      setCountryCounts({});
    }
  }, [filteredResults, items.length]);

  return {
    page: pageQP || 1,
    pageSize,
    order: orderQP || '',
    filteredResults,
    sortedResults,
    paginatedResults,
    total: sortedResults.length,
    visualizationData,
    mapSamples,
    countryCounts,
  };
}
