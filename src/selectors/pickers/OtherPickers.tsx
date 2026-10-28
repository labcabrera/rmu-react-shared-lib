import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAttackTables, fetchFumbleTables } from '../../api/attack-table.api';
import { ITEM_RARITIES } from '../../api/constants';
import { Faction } from '../../api/faction.dto';
import { ITEM_CATEGORIES } from '../../api/item.dto';
import { SpellList } from '../../api/spell-list.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import { EntityKind, itemCategoryImage } from '../../config/default-images';
import { EntityOption } from '../EntityPicker';
import { PickerProps, PresetPicker, useFetched } from './preset';

/** Item category, with its image (`images/items/category-<category>.png` or the generic one) and `item-category-*`. */
export const ItemCategoryPicker: FC<PickerProps<string> & { categories?: readonly string[] }> = ({
  categories = ITEM_CATEGORIES,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      kind="item"
      label={t('category')}
      options={categories.map((category) => ({
        id: category,
        label: t(`item-category-${category}`, { defaultValue: t(category) }),
        imageUrl: itemCategoryImage(category),
        entity: category,
      }))}
    />
  );
};

/** Rarity of an item: four chips, without images. */
export const RarityPicker: FC<PickerProps<string>> = (props) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      hideImages
      label={t('rarity')}
      options={ITEM_RARITIES.map((rarity) => ({ id: rarity, label: t(rarity), entity: rarity }))}
    />
  );
};

/** Strategic game (campaign), with its image and its realm. */
export const StrategicGamePicker: FC<PickerProps<StrategicGame> & { games: StrategicGame[] | undefined }> = ({
  games,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      kind="strategic-game"
      label={t('strategic-game')}
      options={games?.map((game) => ({
        id: game.id,
        label: game.name,
        secondary: game.realmName,
        imageUrl: game.imageUrl,
        entity: game,
      }))}
    />
  );
};

/** Faction of a strategic game, with its image. */
export const FactionPicker: FC<PickerProps<Faction> & { factions: Faction[] | undefined }> = ({
  factions,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      kind="faction"
      label={t('faction')}
      options={factions?.map((faction) => ({
        id: faction.id,
        label: faction.name,
        secondary: faction.shortDescription,
        imageUrl: faction.imageUrl,
        entity: faction,
      }))}
    />
  );
};

/** Spell list, grouped by its type (open, closed, base, evil). */
export const SpellListPicker: FC<PickerProps<SpellList> & { spellLists: SpellList[] | undefined }> = ({
  spellLists,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      kind="spell-list"
      label={t('spell-list')}
      options={spellLists?.map((list) => ({
        id: list.id,
        label: t(list.name, { defaultValue: list.name }),
        secondary: list.realms?.map((realm) => t(realm)).join(' / '),
        group: t(list.type),
        imageUrl: list.imageUrl,
        entity: list,
      }))}
    />
  );
};

type TablePickerProps = PickerProps<string> & {
  /** The table ids; without them the picker loads them (needs an auth and a notification provider, as MfeRoot). */
  tables?: string[];
};

const TablePickerOf: FC<TablePickerProps & { defaultLabel: string }> = ({ tables, defaultLabel, ...props }) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      kind="attack-table"
      label={t(defaultLabel)}
      options={tables?.map((table) => ({ id: table, label: t(table), entity: table }))}
    />
  );
};

const FetchedAttackTablePicker: FC<PickerProps<string>> = (props) => {
  const tables = useFetched(fetchAttackTables);
  return <TablePickerOf {...props} tables={tables} defaultLabel="attack-table" />;
};

const FetchedFumbleTablePicker: FC<PickerProps<string>> = (props) => {
  const tables = useFetched(fetchFumbleTables);
  return <TablePickerOf {...props} tables={tables} defaultLabel="fumble-table" />;
};

/** Attack table (items, NPC attacks). Loads the tables when they are not passed. */
export const AttackTablePicker: FC<TablePickerProps> = (props) =>
  props.tables ? <TablePickerOf {...props} defaultLabel="attack-table" /> : <FetchedAttackTablePicker {...props} />;

/** Fumble table (items, NPC attacks). Loads the tables when they are not passed. */
export const FumbleTablePicker: FC<TablePickerProps> = (props) =>
  props.tables ? <TablePickerOf {...props} defaultLabel="fumble-table" /> : <FetchedFumbleTablePicker {...props} />;

/**
 * A static list of keys (decision 9): archetype, race size, trait category and type, list and spell type, NPC
 * behaviour and category, game status… Each value is shown as `t(labelPrefix + value)`; `images` gives the image of
 * a value, and `kind` the fallback one (without both, no images).
 */
export const EnumPicker: FC<
  PickerProps<string> & {
    values: readonly string[];
    labelPrefix?: string;
    images?: Record<string, string> | ((value: string) => string | undefined);
    kind?: EntityKind;
    /** Group of a value in the select variant. */
    groupOf?: (value: string) => string | undefined;
    label: string;
  }
> = ({ values, labelPrefix = '', images, kind, groupOf, ...props }) => {
  const { t } = useTranslation();
  const imageOf = (value: string) => (typeof images === 'function' ? images(value) : images?.[value]);
  const options: EntityOption<string>[] = values.map((value) => ({
    id: value,
    label: t(`${labelPrefix}${value}`),
    imageUrl: imageOf(value),
    group: groupOf?.(value),
    entity: value,
  }));
  return <PresetPicker props={props} kind={kind} label={props.label} hideImages={!images && !kind} options={options} />;
};
