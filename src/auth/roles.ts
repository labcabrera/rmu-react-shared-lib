import { AuthContextProps, useAuth } from 'react-oidc-context';
import { EntityType } from '../api/common.dto';

/** Keycloak group of the administrators; it reaches the token in the `groups` claim. */
export const ADMIN_GROUP = 'rmu-admin';

/** Groups of the signed-in user, from the `groups` claim of the token. */
export const userGroups = (auth: AuthContextProps): string[] =>
  (auth.user?.profile?.groups as string[] | undefined) ?? [];

/** Whether the signed-in user is an administrator. Only hides UI: the APIs enforce the permission. */
export const isAdmin = (auth: AuthContextProps): boolean => userGroups(auth).includes(ADMIN_GROUP);

/** Hook form of {@link isAdmin}. */
export const useIsAdmin = (): boolean => isAdmin(useAuth());

/** What {@link canEditEntity} reads of an entity. */
export interface EditableEntity {
  owner?: string | null;
  entitySource?: EntityType | null;
}

/**
 * Whether the signed-in user may change or delete the entity (spec 063), with the rule of the APIs: an admin always;
 * otherwise a rulebook (`system`) entity never, and a user entity only its owner. A missing source counts as `user`.
 * Only hides UI: the APIs enforce the permission.
 */
export const canEditEntity = (entity: EditableEntity | null | undefined, auth: AuthContextProps): boolean => {
  if (!entity) return false;
  if (isAdmin(auth)) return true;
  if (entity.entitySource === 'system') return false;
  const sub = auth.user?.profile?.sub;
  return !!sub && entity.owner === sub;
};

/** Hook form of {@link canEditEntity}. */
export const useCanEditEntity = (entity: EditableEntity | null | undefined): boolean =>
  canEditEntity(entity, useAuth());
