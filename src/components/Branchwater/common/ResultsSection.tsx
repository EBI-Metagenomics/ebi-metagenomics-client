import React, { useState } from 'react';
import EMGTable from 'components/UI/EMGTable';
import FiltersBar from './FiltersBar';
import getBranchwaterResultColumns from './resultColumns';
import ResultsDashboard from './ResultsDashboard';
import useBranchwaterResults, {
  BranchwaterFilters,
} from './useBranchwaterResults';

export type BranchwaterResultGeneric = Record<string, unknown> & {
  acc?: string;
  cANI?: number | string;
  containment?: number | string;
};

type ResultsSectionProps<T extends BranchwaterResultGeneric> = {
  items: T[];
  namespace: string; // must be unique per page, end with '-'
  pageSize?: number;
  initialFilters?: Partial<BranchwaterFilters>;
  title?: string;
};

const defaultFilters: BranchwaterFilters = {
  acc: '',
  assay_type: '',
  bioproject: '',
  collection_date_sam: '',
  containment: '',
  geo_loc_name_country_calc: '',
  organism: '',
};

function ResultsSection<T extends BranchwaterResultGeneric>(
  props: ResultsSectionProps<T>
) {
  const { items, namespace, pageSize = 25, initialFilters, title } = props;
  const [filters, setFilters] = useState<BranchwaterFilters>({
    ...defaultFilters,
    ...(initialFilters || {}),
  });

  const results = useBranchwaterResults<T>({
    items,
    namespace,
    pageSize,
    filters,
  });

  const handleFilterChange = (
    field: keyof BranchwaterFilters,
    value: string
  ) => setFilters((prev) => ({ ...prev, [field]: value }));

  const hasResults = Array.isArray(items) && items.length > 0;

  if (!hasResults) return null;

  return (
    <div className="vf-stack vf-stack--400">
      {title && <h4>{title} ({results.total} matches found)</h4>}

      <FiltersBar filters={filters} onFilterChange={handleFilterChange} />

      <div style={{ overflowX: 'auto' }}>
        <EMGTable
          cols={getBranchwaterResultColumns()}
          data={{ items: results.paginatedResults as unknown as T[], count: results.total }}
          className="vf-table"
          showPagination
          expectedPageSize={pageSize}
          sortable
          namespace={namespace}
        />
      </div>

      <ResultsDashboard items={results.filteredResults as unknown as T[]} />
    </div>
  );
}

export default ResultsSection;
