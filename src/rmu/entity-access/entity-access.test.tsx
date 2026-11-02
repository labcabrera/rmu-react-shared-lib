import React from 'react';
import { AuthContextProps } from 'react-oidc-context';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { canEditEntity, canManageEntity } from '../../auth/roles';
import { friendsOf } from '../../api/friendship.api';
import { ApiError } from '../../data/api-error';
import ShareDialog from '../../dialogs/ShareDialog';
import { renderWithProviders } from '../../test/render';
import EntityAccessChip, { entityAccessChipKey } from './EntityAccessChip';

const authWith = (groups: string[], sub = 'owner-1') => ({ user: { profile: { sub, groups } } }) as unknown as AuthContextProps;
const share = (userId: string, level: 'read' | 'write' = 'read') => ({ userId, userName: `name-${userId}`, level, grantedAt: '' });

describe('entity access (spec 069)', () => {
  it('follows the access of the API when it comes', () => {
    const other = authWith(['rmu-user'], 'other-1');
    const admin = authWith(['rmu-admin'], 'admin-1');
    expect(canEditEntity({ owner: 'owner-1', access: 'write' }, other)).toBe(true);
    expect(canManageEntity({ owner: 'owner-1', access: 'write' }, other)).toBe(false);
    expect(canEditEntity({ owner: 'owner-1', access: 'read' }, admin)).toBe(false);
    expect(canManageEntity({ owner: 'owner-1', access: 'manage' }, other)).toBe(true);
    // Without access: the rule of spec 063.
    expect(canManageEntity({ owner: 'owner-1' }, authWith(['rmu-user']))).toBe(true);
    expect(canManageEntity({ owner: 'owner-1' }, other)).toBe(false);
    expect(canManageEntity(null, admin)).toBe(false);
  });

  it('picks the chip of the access', () => {
    expect(entityAccessChipKey({ access: 'manage', shares: [share('a')] })).toBe('entity-access-shared');
    expect(entityAccessChipKey({ access: 'manage', shares: [] })).toBeNull();
    expect(entityAccessChipKey({ access: 'write', accessType: 'public' })).toBe('entity-access-shared-write');
    expect(entityAccessChipKey({ access: 'read', accessType: 'private' })).toBe('entity-access-shared-read');
    expect(entityAccessChipKey({ access: 'read', accessType: 'public' })).toBeNull();
    expect(entityAccessChipKey({})).toBeNull();
    expect(entityAccessChipKey(undefined)).toBeNull();
  });

  it('renders the chip only when there is something to tell', () => {
    const { unmount } = renderWithProviders(<EntityAccessChip entity={{ access: 'write' }} />);
    expect(screen.getByTestId('entity-access-chip')).toBeInTheDocument();
    unmount();
    renderWithProviders(<EntityAccessChip entity={{ access: 'read', accessType: 'public' }} />);
    expect(screen.queryByTestId('entity-access-chip')).toBeNull();
  });

  it('takes the other side of each friendship', () => {
    const friendships = [
      { requesterId: 'me', requesterName: 'ana', addresseeId: 'b', addresseeName: 'bea' },
      { requesterId: 'c', requesterName: 'cris', addresseeId: 'me', addresseeName: 'ana' },
    ];
    expect(friendsOf(friendships, 'me')).toEqual([
      { userId: 'b', userName: 'bea' },
      { userId: 'c', userName: 'cris' },
    ]);
  });

  it('translates the share error codes', () => {
    const error = (code: string) => new ApiError(400, '', JSON.stringify({ code }), '/x');
    expect(error('share-not-friend').messageKey).toBe('error-share-not-friend');
    expect(error('share-self').messageKey).toBe('error-share-self');
    expect(error('share-limit-reached').messageKey).toBe('error-share-limit-reached');
  });
});

describe('ShareDialog (spec 069)', () => {
  it('lists the shares, removes one and adds a friend that has none', async () => {
    const onShare = vi.fn(() => Promise.resolve());
    const onUnshare = vi.fn(() => Promise.resolve());
    renderWithProviders(
      <ShareDialog
        open
        onClose={() => undefined}
        entityName="Arda"
        shares={[share('b', 'write')]}
        friends={[
          { userId: 'b', userName: 'name-b' },
          { userId: 'c', userName: 'name-c' },
        ]}
        onShare={onShare}
        onUnshare={onUnshare}
      />
    );
    expect(screen.getByTestId('share-list')).toHaveTextContent('name-b');

    await userEvent.click(screen.getByRole('button', { name: 'share-remove' }));
    await waitFor(() => expect(onUnshare).toHaveBeenCalledWith('b'));

    await userEvent.click(screen.getByRole('combobox', { name: 'share-friend' }));
    expect(screen.queryByRole('option', { name: 'name-b' })).toBeNull();
    await userEvent.click(screen.getByRole('option', { name: 'name-c' }));
    await userEvent.click(screen.getByRole('button', { name: 'share-action' }));
    await waitFor(() => expect(onShare).toHaveBeenCalledWith('c', 'read'));
  });

  it('tells when there are no friends and when the entity is from the rulebook', () => {
    renderWithProviders(
      <ShareDialog
        open
        system
        onClose={() => undefined}
        entityName="RMU Core"
        shares={[]}
        friends={[]}
        onShare={() => Promise.resolve()}
        onUnshare={() => Promise.resolve()}
      />
    );
    expect(screen.getByText('share-no-friends')).toBeInTheDocument();
    expect(screen.getByText('share-system-read-only')).toBeInTheDocument();
    expect(screen.getByText('share-none')).toBeInTheDocument();
  });
});
