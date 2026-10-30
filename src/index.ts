export { ADMIN_GROUP, isAdmin, useIsAdmin, userGroups } from './auth/roles';
export { default as EditableAvatar } from './avatars/EditableAvatar';
export { default as GenericAvatar } from './avatars/GenericAvatar';
export { default as EntityAvatar, initialsOf } from './avatars/EntityAvatar';
export type { EntityAvatarProps } from './avatars/EntityAvatar';

export { default as RmuBreadcrumbs } from './breadcrumbs/RmuBreadcrumbs';

export { default as AddButton } from './buttons/AddButton';
export { default as BackButton } from './buttons/BackButton';
export { default as CancelButton } from './buttons/CancelButton';
export { default as ClearButton } from './buttons/ClearButton';
export { default as DeleteButton } from './buttons/DeleteButton';
export { default as DownloadButton } from './buttons/DownloadButton';
export { default as EditButton } from './buttons/EditButton';
export { default as LevelUpButton } from './buttons/LevelUpButton';
export { default as NextButton } from './buttons/NextButton';
export { default as RefreshButton } from './buttons/RefreshButton';
export { default as RmuIconButton } from './buttons/RmuIconButton';
export { default as SaveButton } from './buttons/SaveButton';

export * from './config/config.service';
export * from './config/asset-url';
export { defaultImages, entityImage, itemCategoryImage, ITEM_CATEGORIES_WITH_IMAGE } from './config/default-images';
export type { EntityKind } from './config/default-images';

export { default as RmuCard } from './cards/RmuCard';
export { default as RmuTextCard } from './cards/RmuTextCard';
export { default as EntityCard } from './cards/EntityCard';
export type { EntityMetric } from './cards/EntityCard';

export { default as DeleteDialog } from './dialogs/DeleteDialog';
export { default as ImportDialog } from './dialogs/ImportDialog';
export type { ImportRequest } from './dialogs/ImportDialog';
export { default as RmuDialog } from './dialogs/RmuDialog';

export { default as CategorySeparator } from './display/CategorySeparator';
export { default as NotFound } from './display/NotFound';
export { default as RmuPagination } from './display/RmuPagination';
export { default as StatRow } from './display/StatRow';
export { default as TechnicalInfo } from './display/TechnicalInfo';
export { default as KeyValuePanel, KeyValueList } from './display/KeyValuePanel';
export type { KeyValueRow } from './display/KeyValuePanel';

export { default as ImageCategorySelector } from './images/ImageCategorySelector';
export { default as ImageSelectorDialog } from './images/ImageSelectorDialog';
export { default as ImageUploadEditor } from './images/ImageUploadEditor';

export { default as LayoutBase } from './layouts/LayoutBase';
export { default as Section } from './layouts/Section';
export { default as HeroHeader } from './layouts/HeroHeader';
export type { HeroHeaderProps } from './layouts/HeroHeader';
export { default as Panel } from './layouts/Panel';
export { default as SidePanelLayout, useSidePanelMode } from './layouts/SidePanelLayout';
export type { SidePanelMode } from './layouts/SidePanelLayout';
export { default as SectionNav, useSectionParam } from './layouts/SectionNav';
export type { SectionDef } from './layouts/SectionNav';

export { default as ClearableTextField } from './inputs/ClearableTextField';
export { default as NumericInput } from './inputs/NumericInput';
export { default as NumericReadonlyInput } from './inputs/NumericReadonlyInput';
export * from './rolls';

export { default as DifficultyPicker } from './selectors/DifficultyPicker';
export {
  default as CharacterPicker,
  CharacterAvatar,
  CharacterCard,
  characterOption,
  filterByRelation,
  CHARACTER_PICKER_COMPACT_FROM,
  CHARACTER_PICKER_SEARCH_FROM,
} from './selectors/CharacterPicker';
export type {
  CharacterOption,
  CharacterPickerProps,
  CharacterPickerVariant,
  CharacterRelation,
} from './selectors/CharacterPicker';
export { default as EntityPicker, ENTITY_PICKER_TILES_UP_TO } from './selectors/EntityPicker';
export type { EntityOption, EntityPickerProps, EntityPickerVariant } from './selectors/EntityPicker';
export * from './selectors/pickers';
export { default as SkillSelector, SPELL_LIST_SPECIALIZATION } from './selectors/SkillSelector';
export type { OwnedSkill } from './selectors/SkillSelector';
export { default as TraitSelector } from './selectors/TraitSelector';

export * from './api/constants';

export * from './api/api';

export * from './api/common.dto';

export * from './api/attack-table.api';
export * from './api/attack-table.dto';
export * from './api/skill-difficulty.api';
export * from './api/skill-difficulty.dto';
export * from './api/character.api';
export * from './api/character.dto';
export * from './api/character-export.api';
export * from './api/character-export.dto';
export * from './api/character-health.api';
export * from './api/health.dto';
export * from './api/poison.dto';
export * from './api/culture.api';
export * from './api/culture.dto';
export * from './api/effect-type.api';
export * from './api/effect-type.dto';
export * from './api/enumerations.api';
export * from './api/enumerations.dto';
export * from './api/faction.api';
export * from './api/fighting-style.api';
export * from './api/fighting-style.dto';
export * from './api/faction.dto';
export * from './api/image.api';
export * from './api/image.dto';
export * from './api/item.api';
export * from './api/item.dto';
export * from './api/maneuver.api';
export * from './api/maneuver.dto';
export * from './api/maneuver-modifier.api';
export * from './api/maneuver-modifier.dto';
export * from './api/npc.dto';
export * from './api/npc.api';
export * from './api/profession.api';
export * from './api/profession.dto';
export * from './api/race.api';
export * from './api/race.dto';
export * from './api/realm.api';
export * from './api/realm.dto';
export * from './api/resistance-roll.api';
export * from './api/resistance-roll.dto';
export * from './api/skill-category.api';
export * from './api/skill-category.dto';
export * from './api/skill.api';
export * from './api/skill.dto';
export * from './api/spell-list.api';
export * from './api/spell-list.dto';
export * from './api/spell.api';
export * from './api/spell.dto';
export * from './api/strategic-item.api';
export * from './api/strategic-item.dto';
export * from './api/item-modifier.dto';
export * from './api/item-operations.api';
export * from './api/item-operations.dto';
export * from './api/trading-tables.api';
export * from './api/trading-tables.dto';
export * from './api/crafting.api';
export * from './api/crafting.dto';
export * from './api/strategic-game.api';
export * from './api/strategic-game.dto';
export * from './api/tactical-game.api';
export * from './api/tactical-game.dto';
export * from './api/trait.api';
export * from './api/trait.dto';

// Theme
export { createAppTheme, defaultThemeConfig, parseThemeConfig, presetSwatch } from './theme/createAppTheme';
export type { ThemeConfig, ThemeDensity, ThemeMode, ThemePreset } from './theme/createAppTheme';
export { themePresetNames } from './theme/presets';
export { baseColors } from './theme/tokens';

// Motion
export { enterSx, hoverLiftSx, useViewTransitionNavigate, viewTransitionName } from './motion/motion';

// App
export { default as MfeRoot } from './app/MfeRoot';
export { bootstrapMfe } from './app/bootstrapMfe';
export { ErrorBoundary } from './app/ErrorBoundary';
export { NotificationProvider, useNotify, useError } from './app/NotificationProvider';
export type { Notify } from './app/NotificationProvider';

// Data
export { ApiError, isApiError } from './data/api-error';
export { downloadBlob } from './utils/download';
export { usePagedQuery } from './data/usePagedQuery';
export type { PagedFetcher, PagedQuery, PagedQueryOptions } from './data/usePagedQuery';
export { useEntity } from './data/useEntity';
export type { EntityOptions, EntityState } from './data/useEntity';
export { useDebounce } from './data/useDebounce';
export { useListFilters } from './data/useListFilters';
export type {
  FilterChip,
  FilterDef,
  FilterKind,
  FilterSchema,
  FilterValue,
  FilterValues,
  ListFilters,
} from './data/useListFilters';
export { useLocalPagedQuery } from './data/useLocalPagedQuery';
export type { LocalPagedQueryOptions } from './data/useLocalPagedQuery';

// States
export { default as LoadingState } from './ui/states/LoadingState';
export { default as EmptyState } from './ui/states/EmptyState';
export { default as ErrorState } from './ui/states/ErrorState';

// Grid presets
export { gridSizeCard, gridSizeMain, gridSizeResume, itemFilter, itemFilterDisabled } from './layouts/grid';

// Templates and generic components
export { default as ListPage } from './templates/ListPage';
export { FilterPanelToggle, ListResultsBar, useFilterPanelOpen } from './templates/ListPage';
export type { ListPageFilterState, ListPageProps } from './templates/ListPage';
export { default as FilterPanel, FilterSection } from './templates/FilterPanel';
export { default as DetailPage } from './templates/DetailPage';
export type { DetailPageProps } from './templates/DetailPage';
export { default as FormPage } from './templates/FormPage';
export type { FormPageProps } from './templates/FormPage';
export { default as CardGrid } from './templates/CardGrid';
export {
  default as CollectionView,
  CollectionModeSwitch,
  gridSizeShowcase,
  useCollectionMode,
} from './templates/CollectionView';
export type { CollectionConfig, CollectionMode } from './templates/CollectionView';
export { default as FilterBar } from './templates/FilterBar';
export { default as SearchField } from './templates/SearchField';
export type { Breadcrumb } from './templates/types';
export { bottomOffset, usePhone } from './templates/responsive';
export { default as ConfirmDialog } from './ui/ConfirmDialog';
export { default as DataTable } from './ui/DataTable';
export type { DataTableColumn } from './ui/DataTable';
export { default as PreviewDrawer } from './ui/PreviewDrawer';
export { default as FlowSteps } from './ui/FlowSteps';
export type { FlowStep } from './ui/FlowSteps';
export { rsqlAnd } from './data/rsql';

// Rolemaster-specific selects shared by several MFEs
export { default as RollBreakdown, useModifierLabel } from './rmu/RollBreakdown';
export type { RollContext, RollModifier, RollModifierGroup, SkippedRule } from './rmu/RollBreakdown';
export { default as RuleHint, FieldHint, RuleParamList } from './rmu/RuleHint';
export type { RuleParams } from './rmu/RuleHint';
export { default as EffectList, effectColor, effectIcon, normalizeEffectStatus } from './rmu/EffectList';
export { default as StatusBadge } from './rmu/StatusBadge';
export {
  default as CreatureStatBlock,
  additionalCriticalLabel,
  biomeLabel,
  creatureSizeLabel,
} from './rmu/creature/CreatureStatBlock';
export { environmentFactionName, npcImage, npcName, npcSummary } from './rmu/creature/npc-format';
export { isValidNpcCount, NpcEntryDialog, NpcEntryList } from './rmu/creature/NpcEntries';
export type { NpcEntry } from './rmu/creature/NpcEntries';
export type { StatusBadgeColor, StatusBadgeProps } from './rmu/StatusBadge';
export { default as SpellEffectList, spellEffectColor, spellEffectSummary } from './rmu/SpellEffectList';
export type { SpellEffectColor } from './rmu/SpellEffectList';
export {
  spellAreaText,
  spellDurationText,
  spellPerLevelSuffix,
  spellRangeText,
  spellTargetTypesText,
} from './rmu/spell/spell-format';
export type { SpellTranslate } from './rmu/spell/spell-format';
export type { ActorEffect, ActorPenalty } from './rmu/EffectList';
export { default as ActionTypeChip } from './rmu/combat/ActionTypeChip';
export { default as ActionStateMarker } from './rmu/combat/ActionStateMarker';
export { default as ApPips, apPhasePips } from './rmu/combat/ApPips';
export type { ApLedgerItem, ApPip, ApPipState } from './rmu/combat/ApPips';
export { combatActionInfo, combatActionTypes, combatColors, factionColor } from './rmu/combat/actionTypes';
export type { CombatActionCategory, CombatActionState, CombatActionType } from './rmu/combat/actionTypes';
export { default as AttackCard } from './rmu/character/AttackCard';
export { default as ResistanceList } from './rmu/character/ResistanceList';
export { default as ResourceBar } from './rmu/character/ResourceBar';
export type { ResourceKind } from './rmu/character/ResourceBar';
export { default as SkillGroupList, skillCategoryOf, sortSkillsByName } from './rmu/character/SkillGroupList';
export {
  enumerationName,
  loadEnumerationNames,
  resetEnumerationNames,
  specializationLabel,
  toKey,
  useSpecializationLabel,
} from './rmu/enumerations/enumeration-names';
export { default as StatBlock, statKeys } from './rmu/character/StatBlock';
export { default as StatPill, bonusColor, formatBonus } from './rmu/character/StatPill';
export { default as StatBonusGrid } from './rmu/character/StatBonusGrid';
export {
  default as BonusDevPointsSummary,
  DEFAULT_RACE_DEV_POINTS_PER_LEVEL,
} from './rmu/character/BonusDevPointsSummary';
export { default as TraitTypeChip, traitTypeColor } from './rmu/trait/TraitTypeChip';
export { default as ManeuverProfilePanel } from './rmu/maneuver/ManeuverProfilePanel';
export { default as ManeuverModifierList } from './rmu/maneuver/ManeuverModifierList';
export type { ManeuverModifierWithOrigin } from './rmu/maneuver/ManeuverModifierList';
export {
  default as ModifierSelections,
  selectedPriceFactors,
  selectedRollModifiers,
  selectionValue,
} from './rmu/maneuver/ModifierSelections';
export type { ModifierSelectionValues, SelectableModifier } from './rmu/maneuver/ModifierSelections';
export { default as ManeuverOriginChip } from './rmu/maneuver/ManeuverOriginChip';
export type { ManeuverOrigin } from './rmu/maneuver/ManeuverOriginChip';
export { default as InjuryTypeChip } from './rmu/health/InjuryTypeChip';
export { default as ItemConditionChip } from './rmu/item/ItemConditionChip';
export { default as ItemModifierChips } from './rmu/item/ItemModifierChips';
export { default as ItemFeatureChips, itemFeatureLines } from './rmu/item/ItemFeatureChips';
export type { ItemFeatureLine, ItemFeatureSource, ItemFeatureTranslate } from './rmu/item/ItemFeatureChips';
export { default as ItemThumb, itemImageUrl } from './rmu/item/ItemThumb';
export {
  default as ItemCard,
  itemCardImages,
  itemCatalogColumns,
  itemCategoryLabel,
  itemMetrics,
  itemName,
  RARITY_COLORS,
} from './rmu/item/ItemCard';
export {
  default as ItemCatalogBrowser,
  gridSizeItemCard,
  ITEM_CATALOG_MAX,
  ItemCatalogFilterSections,
  ItemSortControl,
  useItemCatalog,
  useItemCatalogQuery,
} from './rmu/item/ItemCatalogBrowser';
export type { ItemCatalogBrowserProps } from './rmu/item/ItemCatalogBrowser';
export {
  ARMOR_CLASSES,
  ARMOR_SLOT_FILTERS,
  ARMOR_TYPES,
  ITEM_FEATURE_FILTERS,
  ITEM_PAGE_SIZES,
  ITEM_SORTS,
  itemCatalogFilters,
  normalizeText,
  sortItems,
  WEAPON_ATTACKS,
  WEAPON_HANDS,
  WEAPON_SKILLS,
  weaponSkillImage,
  weaponSkillLabel,
} from './rmu/item/item-catalog';
export type { ItemCatalogFilterOptions, ItemSort } from './rmu/item/item-catalog';
export { default as MoneyDisplay } from './rmu/item/MoneyDisplay';
export { default as PriceBreakdownView, formatPriceFactorValue } from './rmu/item/PriceBreakdownView';
export { default as ItemInventory, itemTotalValue, itemTotalWeight } from './rmu/item/ItemInventory';
export type { ItemAction } from './rmu/item/ItemInventory';
export { COINS, formatMoney, roundGold, toCoins } from './rmu/item/money';
export type { Coin, CoinAmount } from './rmu/item/money';
export { default as InjurySourceLine } from './rmu/health/InjurySourceLine';
export { default as InjuryCard, recoveryProgress } from './rmu/health/InjuryCard';
export { default as PoisonStageTimeline, poisonStageState, poisonTimeLabel } from './rmu/health/PoisonStageTimeline';
export type { PoisonStageState } from './rmu/health/PoisonStageTimeline';
export { default as PoisonDataFields, isPoisonDataValid } from './rmu/health/PoisonDataFields';
export type { PoisonCatalogItem } from './rmu/health/PoisonDataFields';
export { default as InjuryList, sortInjuries } from './rmu/health/InjuryList';
export { default as HealerPicker, resolveHealer } from './rmu/health/HealerPicker';
export { default as HpBreakdown, formatHpAmount, hpAmountColor } from './rmu/health/HpBreakdown';
export type { HealerCandidate, HealerMode, HealerSelection } from './rmu/health/HealerPicker';
