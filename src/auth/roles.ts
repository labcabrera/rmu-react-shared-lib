import { AuthContextProps, useAuth } from 'react-oidc-context';

/** Keycloak group of the administrators; it reaches the token in the `groups` claim. */
export const ADMIN_GROUP = 'rmu-admin';

/** Groups of the signed-in user, from the `groups` claim of the token. */
export const userGroups = (auth: AuthContextProps): string[] =>
  (auth.user?.profile?.groups as string[] | undefined) ?? [];

/** Whether the signed-in user is an administrator. Only hides UI: the APIs enforce the permission. */
export const isAdmin = (auth: AuthContextProps): boolean => userGroups(auth).includes(ADMIN_GROUP);

/** Hook form of {@link isAdmin}. */
export const useIsAdmin = (): boolean => isAdmin(useAuth());
