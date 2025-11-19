import { useMemo } from 'react';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';

export type BranchwaterFilters = {
  acc: string;
  assay_type: string;
  bioproject: string;
  collection_date_sam: string;
  containment: string;
  geo_loc_name_country_calc: string;
  organism: string;
};

export type UseBranchwaterResultsArgs<T extends Record<string, any>> = {
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
};

function toLowerSafe(v: unknown): string {
  if (v == null) return '';
  try {
    return String(v).toLowerCase();
  } catch {
    return '';
  }
}

function compareValues(a: any, b: any): number {
  // Numeric if both are finite numbers
  const aNum = typeof a === 'string' && a.trim() !== '' ? Number(a) : a;
  const bNum = typeof b === 'string' && b.trim() !== '' ? Number(b) : b;
  const aIsNum = Number.isFinite(aNum);
  const bIsNum = Number.isFinite(bNum);
  if (aIsNum && bIsNum) {
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

export default function useBranchwaterResults<T extends Record<string, any>>({
  items,
  namespace,
  pageSize = 25,
  filters,
}: UseBranchwaterResultsArgs<T>): UseBranchwaterResultsReturn<T> {
  const [pageQP] = useQueryParamState(`${namespace}page`, 1, Number);
  const [orderQP] = useQueryParamState(`${namespace}order`, '');

  const filteredResults = useMemo(() => {
    const f = filters || ({} as BranchwaterFilters);
    return (items || []).filter((it) => {
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
      for (const [key, val] of entries) {
        if (!val) continue;
        const needle = val.toLowerCase();
        const hay = toLowerSafe((it as any)[key]);
        if (!hay.includes(needle)) return false;
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
      const cmp = compareValues((a as any)[field], (b as any)[field]);
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

  return {
    page: pageQP || 1,
    pageSize,
    order: orderQP || '',
    filteredResults,
    sortedResults,
    paginatedResults,
    total: sortedResults.length,
  };
}
