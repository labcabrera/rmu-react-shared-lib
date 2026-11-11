import { AuthContextProps } from 'react-oidc-context';
import { apiUsersUrl } from '../config/config.service';
import callApi, { Page } from './api';

/** A user with an accepted friendship with the signed-in user (spec 069). */
export type Friend = { userId: string; userName: string };

type UsersFriendship = { requesterId: string; requesterName: string; addresseeId: string; addresseeName: string };

/** The other side of each friendship of the signed-in user. */
export const friendsOf = (friendships: UsersFriendship[], userId: string | undefined): Friend[] =>
  friendships.map((f) =>
    f.requesterId === userId ? { userId: f.addresseeId, userName: f.addresseeName } : { userId: f.requesterId, userName: f.requesterName }
  );

/** The accepted friends of the signed-in user, to share entities with them (spec 069). */
export async function fetchFriends(auth: AuthContextProps): Promise<Friend[]> {
  const url = `${apiUsersUrl}/friendships?q=status==accepted&page=0&size=100`;
  const page: Page<UsersFriendship> = await callApi(auth, url, { method: 'GET' });
  return friendsOf(page.content, auth.user?.profile?.sub);
}
