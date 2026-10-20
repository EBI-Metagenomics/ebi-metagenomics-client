import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Table from '../../src/components/UI/EMGTable';
import { createSharedQueryParamContextForTable } from '../../src/hooks/queryParamState/useQueryParamState';

const Location = () => (
  <output data-cy="table-location">{useLocation().search}</output>
);

// Vite loads this helper with the application's React instance.
export function mountTable(
  container,
  rows,
  clientSidePagination,
  initialEntry
) {
  const { QueryParamProvider } = createSharedQueryParamContextForTable(
    'demo',
    undefined,
    2
  );
  const root = createRoot(container);
  root.render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <QueryParamProvider>
        <Location />
        <Table
          cols={[{ header: 'Score', accessorKey: 'attributes.score' }]}
          data={
            clientSidePagination ? rows : { items: rows.slice(0, 2), count: 8 }
          }
          namespace="demo"
          expectedPageSize={2}
          clientSidePagination={clientSidePagination}
          sortable
        />
      </QueryParamProvider>
    </MemoryRouter>
  );
  return root;
}
