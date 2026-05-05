export const sortByOrder = <T extends Record<string, any>>(
  items: T[],
  order: string | null | undefined
): T[] => {
  if (!order) return items;

  const desc = order.startsWith('-');
  const rawField = desc ? order.slice(1) : order;
  const field = rawField === 'last_update' ? 'updated_at' : rawField;

  const dateFields = new Set(['updated_at', 'created_at', 'last_update']);

  return [...items].sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];

    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return desc ? -1 : 1;
    if (valueB == null) return desc ? 1 : -1;

    if (dateFields.has(field)) {
      const timeA = new Date(valueA).getTime();
      const timeB = new Date(valueB).getTime();

      return desc ? timeB - timeA : timeA - timeB;
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return desc ? valueB - valueA : valueA - valueB;
    }

    return desc
      ? String(valueB).localeCompare(String(valueA), undefined, {
          numeric: true,
        })
      : String(valueA).localeCompare(String(valueB), undefined, {
          numeric: true,
        });
  });
};
