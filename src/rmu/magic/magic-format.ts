import type { ItemEnchantment } from '../../api/enchantment.dto';
import {
  magicBonusValue,
  type ItemCharges,
  type MagicItemBonus,
  type MagicItemFeature,
  type MagicItemKind,
  type MagicItemSpell,
  type MagicSpellUse,
} from '../../api/magic-item.dto';
import type { ItemFeatureTranslate } from '../item/ItemFeatureChips';

/** The label of a creature type of table 7-1k (own kebab keys). */
export const creatureTypeLabel = (key: string, t: ItemFeatureTranslate): string =>
  t(`treasure-creature-${key}`, { defaultValue: key });

/** A bonus of the catalog, or a property of an enchantment (which has a few more kinds). */
export type MagicBonusLike = Omit<MagicItemBonus, 'kind'> & { kind: string };

/** "OB bonus +10 · Blade · vs. Undead". */
export const magicBonusText = (bonus: MagicBonusLike, t: ItemFeatureTranslate): string => {
  const parts = [`${t(`magic-bonus-${bonus.kind}`)} ${magicBonusValue(bonus)}`];
  if (bonus.target) parts.push(t(bonus.target, { defaultValue: bonus.target }));
  if (bonus.against) parts.push(t('magic-bonus-against', { creature: creatureTypeLabel(bonus.against, t) }));
  return parts.join(' · ');
};

/** "Daily ×3", "Charges", "Constant"… */
export const magicSpellUseText = (use: MagicSpellUse, perDay: number | null | undefined, t: ItemFeatureTranslate) =>
  use === 'daily' && perDay ? t('magic-spell-per-day', { count: perDay }) : t(`magic-spell-use-${use}`);

/** "Spell (5) · list" or "Spell (5)". */
export const magicSpellName = (spell: Pick<MagicItemSpell, 'name' | 'level' | 'list'>, t: ItemFeatureTranslate) =>
  spell.list
    ? t('enchantment-spell-line', {
        name: spell.name,
        level: spell.level,
        list: t(spell.list, { defaultValue: spell.list }),
      })
    : t('magic-spell-line', { name: spell.name, level: spell.level });

/** What MagicItemInfo shows, from a catalog block or from the enchantment of an item. */
export type MagicItemView = {
  itemLevel: number;
  kind: MagicItemKind | null;
  attunement: boolean | null;
  realm: string | null;
  days: number | null;
  standardPrice: number | null;
  /** Max charges of the catalog, or the current and max of an item. */
  charges: { current: number | null; max: number } | null;
  source: string | null;
  alchemistName: string | null;
  bonuses: MagicBonusLike[];
  spells: (Pick<MagicItemSpell, 'name' | 'level' | 'list'> & { use: MagicSpellUse | null; perDay?: number | null })[];
};

/** The view of a `features.magic` catalog block. */
export const magicFeatureView = (magic: MagicItemFeature): MagicItemView => ({
  itemLevel: magic.itemLevel,
  kind: magic.kind,
  attunement: magic.attunement,
  realm: magic.realm,
  days: magic.days,
  standardPrice: magic.standardPrice,
  charges: magic.charges ? { current: null, max: magic.charges } : null,
  source: null,
  alchemistName: null,
  bonuses: magic.bonuses ?? [],
  spells: (magic.spells ?? []).map((spell) => ({ ...spell })),
});

/** The view of the enchantment of an item and its charges. */
export const enchantmentView = (enchantment: ItemEnchantment, charges?: ItemCharges | null): MagicItemView => ({
  itemLevel: enchantment.itemLevel,
  kind: enchantment.kind ?? null,
  attunement: enchantment.attunement ?? null,
  realm: null,
  days: null,
  standardPrice: null,
  charges: charges ? { current: charges.current, max: charges.max } : null,
  source: enchantment.source ?? 'alchemy',
  alchemistName: enchantment.alchemistName ?? null,
  bonuses: (enchantment.properties ?? [])
    // The charges are the ones of the item.
    .filter((property) => property.kind !== 'charges')
    .map((property) => ({
      kind: property.kind,
      value: property.value,
      target: property.target ?? null,
      against: property.against ?? null,
    })),
  spells: (enchantment.spells ?? []).map((spell) => ({
    name: spell.name,
    level: spell.level,
    list: spell.listCode ?? null,
    use: null,
  })),
});

/** One line of a magic item: "Weapon · level 10 · OB +10". */
export const magicItemSummary = (
  magic: { kind: MagicItemKind; bonuses?: MagicBonusLike[]; itemLevel?: number | null },
  t: ItemFeatureTranslate
): string => {
  const parts = [t(`magic-kind-${magic.kind}`)];
  if (magic.itemLevel !== null && magic.itemLevel !== undefined)
    parts.push(t('magic-item-level-value', { level: magic.itemLevel }));
  (magic.bonuses ?? []).forEach((bonus) => parts.push(magicBonusText(bonus, t)));
  return parts.join(' · ');
};
