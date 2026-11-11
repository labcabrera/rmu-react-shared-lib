export {
  canEditEntity,
  canManageEntity,
  useCanEditEntity,
  useCanManageEntity,
  isAdmin,
  useIsAdmin,
} from './auth/roles';
export type { EditableEntity } from './auth/roles';
export { default as EntityImage } from './avatars/EntityImage';
export type { EntityImageProps, EntityImageSize } from './avatars/EntityImage';
export { avatarSize, default as EntityAvatar } from './avatars/EntityAvatar';
export type { EntityAvatarProps } from './avatars/EntityAvatar';

export { default as RmuBreadcrumbs } from './breadcrumbs/RmuBreadcrumbs';

export { default as AddButton } from './buttons/AddButton';
export { default as CancelButton } from './buttons/CancelButton';
export { default as DeleteButton } from './buttons/DeleteButton';
export { default as DownloadButton } from './buttons/DownloadButton';
export { default as EditButton } from './buttons/EditButton';
export { default as LevelUpButton } from './buttons/LevelUpButton';
export { default as RefreshButton } from './buttons/RefreshButton';
export { default as RmuIconButton } from './buttons/RmuIconButton';

export * from './config/config.service';
export * from './config/asset-url';
export { defaultImages, entityImage, itemCategoryImage, itemImageFolder } from './config/default-images';
export type { EntityKind } from './config/default-images';

export { default as EntityCard } from './cards/EntityCard';
export type { EntityMetric } from './cards/EntityCard';

export { default as DeleteDialog } from './dialogs/DeleteDialog';
export { default as ImportDialog } from './dialogs/ImportDialog';
export type { ImportRequest } from './dialogs/ImportDialog';
export { default as RmuDialog } from './dialogs/RmuDialog';
export { default as ShareDialog } from './dialogs/ShareDialog';
export type { ShareDialogProps } from './dialogs/ShareDialog';

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
export { default as SidePanelLayout } from './layouts/SidePanelLayout';
export type { SidePanelMode } from './layouts/SidePanelLayout';
export { default as SectionNav, useSectionParam } from './layouts/SectionNav';
export type { SectionDef } from './layouts/SectionNav';

export { default as ClearableTextField } from './inputs/ClearableTextField';
export { default as NumericInput } from './inputs/NumericInput';
export { default as OptionGroup } from './inputs/OptionGroup';
export type { OptionGroupOption, OptionGroupProps } from './inputs/OptionGroup';
export * from './rolls';

export { default as DifficultyPicker } from './selectors/DifficultyPicker';
export {
  default as CharacterPicker,
  CharacterAvatar,
  CharacterCard,
  characterOption,
} from './selectors/CharacterPicker';
export type {
  CharacterOption,
  CharacterPickerProps,
  CharacterPickerVariant,
  CharacterRelation,
} from './selectors/CharacterPicker';
export { default as EntityPicker } from './selectors/EntityPicker';
export type { EntityOption, EntityPickerProps, EntityPickerVariant } from './selectors/EntityPicker';
export * from './selectors/pickers';
export { default as SkillSelector } from './selectors/SkillSelector';
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
export * from './api/healing-tables';
export * from './api/health.dto';
export * from './api/temporary-modifier.dto';
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
export * from './api/encounter.dto';
export * from './api/encounter.api';
export * from './api/profession.api';
export * from './api/profession.dto';
export * from './api/race.api';
export * from './api/race.dto';
export * from './api/realm.api';
export * from './api/realm.dto';
export * from './api/friendship.api';
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
export * from './api/treasure-goods.api';
export * from './api/treasure-goods.dto';
export * from './api/crafting.api';
export * from './api/crafting.dto';
export * from './api/enchantment.api';
export * from './api/enchantment.dto';
export * from './api/magic-item.dto';
export * from './api/treasure-tables.dto';
export * from './api/treasure.dto';
export * from './api/treasure.api';
export * from './api/strategic-game.api';
export * from './api/strategic-game.dto';
export * from './api/tactical-game.api';
export * from './api/tactical-game.dto';
export * from './api/combat-talents.dto';
export * from './api/combat-core-law.dto';
export * from './api/combat-block-a-079.dto';
export * from './api/combat-block-b-079.dto';
export * from './api/health-079.dto';
export * from './api/environment-079.dto';
export * from './api/talents-079.dto';
export * from './api/trait.api';
export * from './api/trait.dto';

// Theme
export { createAppTheme, parseThemeConfig, presetSwatch } from './theme/createAppTheme';
export type { ThemeConfig, ThemeDensity, ThemeMode, ThemePreset } from './theme/createAppTheme';
export { themePresetNames } from './theme/presets';

// Motion
export { enterSx, hoverLiftSx, useViewTransitionNavigate, viewTransitionName } from './motion/motion';

// App
export { default as MfeRoot } from './app/MfeRoot';
export { ErrorBoundary } from './app/ErrorBoundary';
export { NotificationProvider, useApiNotify, useNotify } from './app/NotificationProvider';
export type { Notify } from './app/NotificationProvider';

// Data
export { ApiError, apiErrorCode, apiErrorDetails, ConfirmCancelledError, isApiError } from './data/api-error';
export { signed } from './utils/signed';
export { downloadBlob } from './utils/download';
export { TABLES_NAMESPACE, useTableText } from './i18n/table-text';
export {
  SPELL_NAME_MATCHES_MAX,
  SPELL_NAMES_NAMESPACE,
  spellNameRsql,
  spellTextNamespace,
  translateSpellName,
  useSpellName,
  useSpellNameMatches,
  useSpellText,
} from './i18n/spell-text';
export type { SpellText } from './i18n/spell-text';
export { SKILL_TEXT_NAMESPACE, useSkillText } from './i18n/skill-text';
export type { SkillText } from './i18n/skill-text';
export { formatCampaignDate, formatElapsedTime } from './utils/campaign-date';
export { usePagedQuery } from './data/usePagedQuery';
export type { PagedFetcher, PagedQuery, PagedQueryOptions } from './data/usePagedQuery';
export { API_PAGE_SIZE, fetchAllPages, fetchFullPage } from './data/fetch-all-pages';
export type { PageFetcher } from './data/fetch-all-pages';
export { createRmuQueryClient } from './data/query-client';
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
export { useCatalogByLabel } from './data/useCatalogByLabel';
export { useLocalPagedQuery } from './data/useLocalPagedQuery';
export type { LocalPagedQueryOptions } from './data/useLocalPagedQuery';

// States
export { default as LoadingState } from './ui/states/LoadingState';
export { default as EmptyState } from './ui/states/EmptyState';
export { default as ErrorState } from './ui/states/ErrorState';

// Grid presets
export {
  cardColumns,
  cardGridContainerSx,
  cardGridSx,
  CARD_COLUMNS_VAR,
  sideFilterGridSx,
  gridSizeCard,
  itemFilter,
  itemFilterDisabled,
} from './layouts/grid';

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
export { default as CollectionView, CollectionModeSwitch, useCollectionMode } from './templates/CollectionView';
export type { CollectionConfig, CollectionMode } from './templates/CollectionView';
export { default as FilterBar } from './templates/FilterBar';
export { default as SearchField } from './templates/SearchField';
export type { Breadcrumb } from './templates/types';
export { bottomOffset, usePhone } from './templates/responsive';
export { default as ConfirmDialog } from './ui/ConfirmDialog';
export { default as DataTable } from './ui/DataTable';
export type { DataTableColumn, DataTablePagination } from './ui/DataTable';
export { default as PreviewDrawer } from './ui/PreviewDrawer';
export { default as FlowSteps } from './ui/FlowSteps';
export type { FlowReviewAction, FlowStep } from './ui/FlowSteps';
export { rsqlAnd } from './data/rsql';

// Rolemaster-specific selects shared by several MFEs
export { default as RollBreakdown, useModifierLabel } from './rmu/RollBreakdown';
export type { RollContext, RollModifier, RollModifierGroup, SkippedRule } from './rmu/RollBreakdown';
export { default as RuleHint, FieldHint } from './rmu/RuleHint';
export { default as EntitySourceChip } from './rmu/entity-source/EntitySourceChip';
export { default as EntityAccessChip, entityAccessChipKey } from './rmu/entity-access/EntityAccessChip';
export type { EntityAccessChipProps } from './rmu/entity-access/EntityAccessChip';
export type { EntitySourceChipProps } from './rmu/entity-source/EntitySourceChip';
export { default as EntitySourceField } from './rmu/entity-source/EntitySourceField';
export type { EntitySourceFieldProps } from './rmu/entity-source/EntitySourceField';
export { ENTITY_SOURCES, entitySourceFilter } from './rmu/entity-source/entity-source';
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
export { NpcEntryDialog, NpcEntryList } from './rmu/creature/NpcEntries';
export type { NpcEntry } from './rmu/creature/NpcEntries';
export type { StatusBadgeColor, StatusBadgeProps } from './rmu/StatusBadge';
export { default as SpellEffectList } from './rmu/SpellEffectList';
export type { SpellEffectColor } from './rmu/SpellEffectList';
export {
  spellAreaText,
  spellDurationText,
  spellPerLevelSuffix,
  spellRangeText,
  spellSpecsRows,
} from './rmu/spell/spell-format';
export type { SpellSpecsKind, SpellSpecsRow } from './rmu/spell/spell-format';
export type { SpellTranslate } from './rmu/spell/spell-format';
export type { ActorEffect, ActorNameResolver, ActorPenalty } from './rmu/EffectList';
export { default as ActionTypeChip } from './rmu/combat/ActionTypeChip';
export { default as ActionStateMarker } from './rmu/combat/ActionStateMarker';
export { default as ApPips } from './rmu/combat/ApPips';
export type { ApLedgerItem, ApPip, ApPipState } from './rmu/combat/ApPips';
export { combatActionInfo, combatColors, factionColor } from './rmu/combat/actionTypes';
export type { CombatActionCategory, CombatActionState, CombatActionType } from './rmu/combat/actionTypes';
export { default as AttackCard } from './rmu/character/AttackCard';
export { obMargin } from './rmu/combat/ob-margin';
export type { ObAttack } from './rmu/combat/ob-margin';
export { default as AttackSizeChip } from './rmu/combat/AttackSizeChip';
export {
  ATTACK_SIZE_SCALE,
  MEDIUM_SIZE_CLASS,
  attackSizeEffect,
  clampSizeSteps,
  expectedCriticalShift,
  formatMultiplier,
  signedSteps,
} from './rmu/combat/attack-size';
export type { AttackSizeEffect, AttackSizeStep } from './rmu/combat/attack-size';
export { default as SideStrengthBar } from './rmu/combat/SideStrengthBar';
export type { SideStrengthBarProps } from './rmu/combat/SideStrengthBar';
export {
  SIDE_STRENGTH_FLED,
  SIDE_STRENGTH_INCAPACITATED,
  SIDE_STRENGTH_THRESHOLDS,
  sideStrength,
  sideStrengthLevel,
  sideStrengthState,
  standingShare,
} from './rmu/combat/side-strength';
export type { SideStrength, SideStrengthActor, SideStrengthSide } from './rmu/combat/side-strength';
export { default as ResistanceList } from './rmu/character/ResistanceList';
export { default as ResourceBar } from './rmu/character/ResourceBar';
export type { ResourceKind } from './rmu/character/ResourceBar';
export { default as SkillGroupList, skillCategoryOf, sortSkillsByName } from './rmu/character/SkillGroupList';
export {
  resetEnumerationNames,
  specializationLabel,
  toKey,
  useSpecializationLabel,
} from './rmu/enumerations/enumeration-names';
export { default as StatBlock, statKeys } from './rmu/character/StatBlock';
export { default as StatPill, bonusColor, formatBonus } from './rmu/character/StatPill';
export { default as StatBonusGrid } from './rmu/character/StatBonusGrid';
export { default as BonusDevPointsSummary } from './rmu/character/BonusDevPointsSummary';
export { default as SituationalSenseTraits, senseTraitsOf } from './rmu/character/SituationalSenseTraits';
export { default as SituationalTalentBonuses } from './rmu/character/SituationalTalentBonuses';
export { default as TraitTypeChip } from './rmu/trait/TraitTypeChip';
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
export { default as ItemEnchantmentInfo } from './rmu/alchemy/ItemEnchantmentInfo';
export { default as SpellAlchemyInfo } from './rmu/alchemy/SpellAlchemyInfo';
export { alchemyEffectText } from './rmu/alchemy/alchemy-format';
export { default as MagicItemInfo } from './rmu/magic/MagicItemInfo';
export type { MagicItemInfoProps } from './rmu/magic/MagicItemInfo';
export { default as GemTraits } from './rmu/magic/GemTraits';
export type { GemTraitsProps } from './rmu/magic/GemTraits';
export { default as MagicItemDialog, buildMagicItemRequest } from './rmu/magic/MagicItemDialog';
export type { MagicItemDialogProps } from './rmu/magic/MagicItemDialog';
export { default as TreasureDialog } from './rmu/treasure/TreasureDialog';
export type { TreasureDialogProps } from './rmu/treasure/TreasureDialog';
export { default as TreasureRollPanel } from './rmu/treasure/TreasureRollPanel';
export type { TreasureRollPanelProps, TreasureTableFocus } from './rmu/treasure/TreasureRollPanel';
export * from './rmu/treasure/treasure-table-model';
export {
  creatureTypeLabel,
  magicBonusText,
  magicItemSummary,
  magicSpellName,
  magicSpellUseText,
} from './rmu/magic/magic-format';
export type { MagicBonusLike } from './rmu/magic/magic-format';
export { default as ItemFeatureChips, itemFeatureLines, moneyText } from './rmu/item/ItemFeatureChips';
export { default as ItemFeaturesView } from './rmu/item/ItemFeaturesView';
export type { ItemFeatureSection } from './rmu/item/ItemFeaturesView';
export { catalogUnitValue, strategicItemUnitValue } from './rmu/item/item-value';
export type { UnitValueSource } from './rmu/item/item-value';
export type { ItemFeatureLine, ItemFeatureSource, ItemFeatureTranslate } from './rmu/item/ItemFeatureChips';
export { default as ItemThumb, itemImageUrl } from './rmu/item/ItemThumb';
export {
  default as ItemCard,
  itemCatalogColumns,
  itemCategoryLabel,
  itemName,
  RARITY_COLORS,
} from './rmu/item/ItemCard';
export {
  default as ItemCatalogBrowser,
  ITEM_CATALOG_MAX,
  ITEM_CATALOG_PAGE,
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
  MAGIC_LEVEL_FILTERS,
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
export { default as ItemInventory } from './rmu/item/ItemInventory';
export type { ItemAction } from './rmu/item/ItemInventory';
export { formatMoney, roundGold, toCoins } from './rmu/item/money';
export type { Coin, CoinAmount } from './rmu/item/money';
export { default as InjurySourceLine } from './rmu/health/InjurySourceLine';
export { default as InjuryCard, InjuryCareChips } from './rmu/health/InjuryCard';
export { default as TemporaryModifierList, temporaryModifierExpiry } from './rmu/health/TemporaryModifierList';
export { default as PoisonStageTimeline } from './rmu/health/PoisonStageTimeline';
export type { PoisonStageState } from './rmu/health/PoisonStageTimeline';
export { default as PoisonDataFields, isPoisonDataValid } from './rmu/health/PoisonDataFields';
export type { PoisonCatalogItem } from './rmu/health/PoisonDataFields';
export { default as InjuryList } from './rmu/health/InjuryList';
export { default as AntidoteFields, antidoteDto, EMPTY_ANTIDOTE_FIELDS } from './rmu/health/AntidoteFields';
export type { AntidoteFieldsValue } from './rmu/health/AntidoteFields';
export { default as HerbUseFields } from './rmu/health/HerbUseFields';
export { default as HealerPicker, resolveHealer } from './rmu/health/HealerPicker';
export { default as HpBreakdown, formatHpAmount, hpAmountColor } from './rmu/health/HpBreakdown';
export type { HealerCandidate, HealerMode, HealerSelection } from './rmu/health/HealerPicker';

// Spec 066: shared pieces for a consistent UI
export { default as SectionLabel } from './layouts/SectionLabel';
export { default as RmuChip } from './ui/RmuChip';
export type { RmuChipProps, RmuChipTone, RmuChipVariant } from './ui/RmuChip';
export { Bento, span } from './layouts/Bento';
export type { PanelVariant } from './layouts/Panel';
export { KeyValueLine, keyValueColor } from './display/KeyValuePanel';
export type { KeyValueTone } from './display/KeyValuePanel';
export { default as ChipRow } from './display/ChipRow';
export { default as SelectableCard, selectableSx } from './ui/SelectableCard';
export { default as MessageScreen } from './ui/MessageScreen';
export { default as OptionsHelpDialog, OptionsHelpButton } from './ui/OptionsHelpDialog';
export type { OptionHelp } from './ui/OptionsHelpDialog';
export { default as AccessTypeChip } from './rmu/AccessTypeChip';
export {
  CRITICAL_SEVERITY_LEGEND,
  CRITICAL_SEVERITY_COLORS,
  criticalSeverityColor,
  criticalSeverityTextColor,
} from './rmu/combat/critical-severity';
export { default as RollResultAlert } from './rolls/RollResultAlert';
export { bindSingle, equalsFilter, FilterSearchField, realmName, regexFilter, useRealms } from './data/list-filters';
export type { FilterAccess } from './data/list-filters';
export { default as NumberPad, outOfRange, parsePadText } from './inputs/NumberPad';
export type { NumberPadProps } from './inputs/NumberPad';
export { default as NumberPadField } from './inputs/NumberPadField';
export type { NumberPadFieldProps, NumberPadPresentation } from './inputs/NumberPadField';
