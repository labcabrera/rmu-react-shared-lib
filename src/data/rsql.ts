/**
 * Joins RSQL conditions with `;` (AND), skipping the ones whose value is empty.
 * rsqlAnd([['name=re=', name], ['category==', category]]) -> "name=re=sword;category==weapon"
 */
export const rsqlAnd = (conditions: [prefix: string, value: string | number | null | undefined][]): string =>
  conditions
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([prefix, value]) => `${prefix}${value}`)
    .join(';');
