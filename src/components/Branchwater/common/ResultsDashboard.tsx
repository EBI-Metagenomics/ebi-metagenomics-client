import React, { useMemo } from 'react';

// Narrow the generic constraint to only what this component actually needs,
// removing reliance on `any`.
export type ResultsDashboardProps<
  T extends { geo_loc_name_country_calc?: string | null }
> = {
  items: T[];
};

function getCountryColor(count: number, max: number): string {
  if (max <= 0) return '#e9ecef';
  const ratio = count / max;
  if (ratio > 0.8) return '#007bff22';
  if (ratio > 0.6) return '#28a74522';
  if (ratio > 0.4) return '#ffc10722';
  if (ratio > 0.2) return '#fd7e1422';
  return '#6c757d22';
}

const ResultsDashboard = <
  T extends { geo_loc_name_country_calc?: string | null }
>({
  items,
}: ResultsDashboardProps<T>) => {
  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (items || []).forEach((it) => {
      const c = String(it.geo_loc_name_country_calc ?? '').trim();
      if (!c) return;
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [items]);

  const uniqueCountries = Object.keys(countryCounts).filter(Boolean);
  const maxCount = Math.max(0, ...Object.values(countryCounts));

  return (
    <div className="vf-u-padding__top--600">
      <h4 className="vf-text vf-text-heading--4">Results Dashboard</h4>
      <div className="vf-u-padding__bottom--400">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: 8,
              border: '1px solid #dee2e6',
              textAlign: 'center',
            }}
          >
            <div style={{ color: '#495057', marginBottom: 8 }}>
              Total Matches
            </div>
            <div style={{ fontSize: '2em', fontWeight: 700, color: '#28a745' }}>
              {items?.length || 0}
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: 8,
              border: '1px solid #dee2e6',
              textAlign: 'center',
            }}
          >
            <div style={{ color: '#495057', marginBottom: 8 }}>
              Unique Countries
            </div>
            <div style={{ fontSize: '2em', fontWeight: 700, color: '#17a2b8' }}>
              {uniqueCountries.length}
            </div>
          </div>
        </div>
      </div>
      {uniqueCountries.length > 0 && (
        <div className="vf-u-padding__top--200">
          <div className="vf-text vf-text--body" style={{ marginBottom: 8 }}>
            <strong>Samples by Country:</strong>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              maxHeight: 120,
              overflowY: 'auto',
            }}
          >
            {uniqueCountries
              .sort((a, b) => (countryCounts[b] || 0) - (countryCounts[a] || 0))
              .map((c) => (
                <span
                  key={c}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: getCountryColor(
                      countryCounts[c],
                      maxCount
                    ),
                    border: '1px solid #dee2e6',
                    borderRadius: 6,
                  }}
                >
                  {c}: {countryCounts[c]}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDashboard;
