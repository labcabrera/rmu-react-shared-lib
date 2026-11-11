import { EntityType } from '../../api/common.dto';
import { FilterDef } from '../../data/useListFilters';

/** Sources of an entity (spec 063): rulebook content or user content. */
export const ENTITY_SOURCES: readonly EntityType[] = ['system', 'user'];

/** Source of an entity; a missing one counts as `user`, never `system`. */
export const entitySourceOf = (entity: { entitySource?: EntityType | null } | null | undefined): EntityType =>
  entity?.entitySource ?? 'user';

type Translate = (key: string) => string;

/**
 * «Source» filter of a list (spec 063, decision 8), for useListFilters: a `single` with `system` and `user`. `match`
 * filters lists loaded whole on the client; `toRsql` serves the lists paged by the API (`!=system`, so documents
 * without the field count as user content).
 */
export const entitySourceFilter = <T extends { entitySource?: EntityType | null }>(t: Translate): FilterDef<T> => ({
  kind: 'single',
  label: t('entity-source'),
  options: ENTITY_SOURCES,
  format: (value) => t(`entity-source-${value}`),
  match: (entity, value) => entitySourceOf(entity) === value,
  toRsql: (value) => (value === 'system' ? 'entitySource==system' : 'entitySource!=system'),
});
