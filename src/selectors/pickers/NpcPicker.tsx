import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import type { AuthContextProps } from 'react-oidc-context';
import { fetchNpcs } from '../../api/npc.api';
import { Npc } from '../../api/npc.dto';
import { fetchGenericRealms } from '../../api/realm.api';
import { useNotify } from '../../app/NotificationProvider';
import { npcImage, npcName, npcSummary } from '../../rmu/creature/npc-format';
import { EntityOption } from '../EntityPicker';
import { PickerProps, PresetPicker } from './preset';

/** RSQL of the NPCs of some realms. */
export const npcRealmsRsql = (realmIds: string[]): string => `realmId=in=(${realmIds.join(',')})`;

/**
 * The NPCs a campaign of `realmId` can use (spec 055, decision 6): those of its realm and of the generic realms (RMU
 * Core). The npcs API already leaves out the private NPCs of other users.
 */
export async function fetchCampaignNpcs(realmId: string, auth: AuthContextProps): Promise<Npc[]> {
  const generic = await fetchGenericRealms(auth);
  const realmIds = [...new Set([realmId, ...generic.map((realm) => realm.id)])];
  return (await fetchNpcs(npcRealmsRsql(realmIds), 0, 1000, auth)).content;
}

/** {@link fetchCampaignNpcs} as a hook: `undefined` while they load or without a realm. */
export const useCampaignNpcs = (realmId: string | null | undefined): Npc[] | undefined => {
  const auth = useAuth();
  const notify = useNotify();
  const [npcs, setNpcs] = useState<Npc[]>();
  useEffect(() => {
    setNpcs(undefined);
    if (!realmId) return;
    let current = true;
    fetchCampaignNpcs(realmId, auth)
      .then((values) => current && setNpcs(values))
      .catch(notify.error);
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realmId]);
  return npcs;
};

/** Options of some NPCs: translated name, category and level, grouped by category and sorted by name. */
export const npcOptions = (npcs: Npc[], t: (key: string) => string): EntityOption<Npc>[] =>
  npcs
    .map((npc) => ({
      id: npc.id,
      label: npcName(npc, t),
      secondary: npcSummary(npc, t),
      imageUrl: npcImage(npc),
      group: t(`npc-category-${npc.category}`),
      entity: npc,
    }))
    .sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));

/**
 * NPC of a campaign (spec 055): a searchable select of the NPCs of the campaign's realm and of the generic realms,
 * found by their translated name. Pass `npcs` when the caller already has them, or `realmId` to load them.
 */
export const NpcPicker: FC<PickerProps<Npc> & { realmId?: string | null; npcs?: Npc[] }> = ({
  realmId,
  npcs,
  ...props
}) => {
  const { t } = useTranslation();
  const loaded = useCampaignNpcs(npcs ? undefined : realmId);
  const list = npcs ?? loaded;
  const options = useMemo(() => list && npcOptions(list, t), [list, t]);
  return <PresetPicker props={{ variant: 'select', ...props }} kind="npc" label={t('npc')} options={options} />;
};
