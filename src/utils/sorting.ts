export const sortByOrder = <T>(
  items: T[],
  order: string | null | undefined
): T[] => {
  if (!order) return items;

  const desc = order.startsWith('-');
  const field = desc ? order.slice(1) : order;

  return [...items].sort((a: any, b: any) => {
    const valueA = a[field];
    const valueB = b[field];

    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return desc ? -1 : 1;
    if (valueB == null) return desc ? 1 : -1;

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return desc ? valueB - valueA : valueA - valueB;
    }

    const stringA = String(valueA);
    const stringB = String(valueB);

    return desc
      ? stringB.localeCompare(stringA, undefined, { numeric: true })
      : stringA.localeCompare(stringB, undefined, { numeric: true });
  });
};
