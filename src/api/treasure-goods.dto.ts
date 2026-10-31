// Treasure Law goods (workspace spec 062): the herb, acid, intoxicant, gem, jewelry, animal and property blocks of
// the catalog, the size, carats and jewelry class of an owned item, and the requests of the herb endpoints.
import type { CriticalSeverity } from './attack-table.dto';
import type { InjuryType } from './health.dto';
import type { RollModifier } from './item-operations.dto';
import type { StrategicItem } from './strategic-item.dto';

/** Biome codes of Treasure Law table 2-3b (the ones of Core Law table 15-1); labels `npc-biome-<code>`. */
export const HERB_BIOMES = ['A', 'O', 'U', 'I', 'T', 'B', 'X', 'P', 'F', 'D', 'S', 'J'] as const;
export type HerbBiome = (typeof HERB_BIOMES)[number];

/** Difficulty codes as the catalog stores them; `n` is the nigh impossible `ni` of MANEUVER_DIFFICULTIES. */
export type DifficultyCode = 'c' | 's' | 'r' | 'e' | 'l' | 'm' | 'h' | 'vh' | 'xh' | 'sf' | 'a' | 'n' | 'ni';

/** Difficulty codes of the catalog forms, from casual to nigh impossible. */
export const ITEM_DIFFICULTY_CODES = ['c', 's', 'r', 'e', 'l', 'm', 'h', 'vh', 'xh', 'sf', 'a', 'ni'] as const;

/** The i18n key of a difficulty code (`difficulty-<code>`). */
export const difficultyCodeKey = (code: string): string => `difficulty-${code === 'n' ? 'ni' : code}`;

export const HERB_GROUPS = ['antidote', 'general', 'injury', 'life', 'minor-healing', 'alteration', 'stun'] as const;
export type HerbGroup = (typeof HERB_GROUPS)[number];

export const HERB_PREPS = ['apply', 'brew', 'ingest', 'liquid', 'paste', 'powder'] as const;
export type HerbPrep = (typeof HERB_PREPS)[number];

/** Kebab key of the part of the plant (`leaf`, `root`, `berry`...); label `herb-form-<key>`. */
export type HerbForm = string;

export const HERB_EFFECT_DELAYS = ['immediate', 'rounds', 'minutes'] as const;
export type HerbEffectDelay = (typeof HERB_EFFECT_DELAYS)[number];

/** A herb that treats any kind of injury. */
export const ANY_INJURY = 'any';
export type HerbTreats = InjuryType | typeof ANY_INJURY;

/** Stun relief that removes every round of stun. */
export const ALL_STUN_ROUNDS = 999;

/** What a rule reads of the effect of a herb; the rest of it is in the description. */
export type HerbEffects = {
  /** Hits restored, a dice range. */
  heal: { min: number; max: number } | null;
  /** Rounds of stun removed; 999 removes all. */
  stunRelief: number | null;
  /** Injury types it treats, or `any`. */
  treats: HerbTreats[] | null;
  /** Extra bonus to the recovery-time roll when the book states it. */
  recoveryBonus: number | null;
};

/** `features.herb` of a catalog item. */
export type ItemHerb = {
  group: HerbGroup;
  biomes: HerbBiome[];
  /** Only at high altitude in those biomes ("/A"). */
  highAltitude: boolean;
  find: DifficultyCode;
  form: HerbForm;
  prep: HerbPrep;
  /** Short text as printed (English), shown as is. */
  season: string | null;
  effectDelay: HerbEffectDelay;
  /** False for the mundane herbs of 0.1 sp. */
  magical: boolean;
  addictionFactor: number | null;
  effects: HerbEffects | null;
};

export const ACID_STRENGTHS = [
  'extremely-weak',
  'very-weak',
  'weak',
  'mild',
  'strong',
  'very-strong',
  'extremely-strong',
] as const;
export type AcidStrength = (typeof ACID_STRENGTHS)[number];
export const ACID_TARGETS = ['any', 'undead-demon', 'undead', 'demon'] as const;
export type AcidTargets = (typeof ACID_TARGETS)[number];

/** `features.acid` of a catalog item. */
export type ItemAcid = {
  strength: AcidStrength;
  /** Acid critical of a splash: A-50 is `{ severity: 'A', modifier: -50 }`. */
  splash: { severity: CriticalSeverity; modifier: number } | null;
  /** "2B/rnd" is `{ severity: 'B', count: 2, everyRounds: 1 }`. */
  immersion: { severity: string; count: number; everyRounds: number } | null;
  /** RR of the level; "-1/3 failure" is `{ penalty: -1, perFailure: 3 }`. */
  ingestion: { level: number; penalty: number; perFailure: number } | null;
  breakageMod: number;
  craftDifficulty: DifficultyCode;
  targets: AcidTargets;
};

/** `features.intoxicant` of a catalog item. */
export type ItemIntoxicant = { addictionFactor: number | null; form: HerbForm | null; prep: HerbPrep | null };

export const GEM_GRADES = ['precious', 'semi-precious'] as const;
export type GemGrade = (typeof GEM_GRADES)[number];

export type NumberRange = { min: number; max: number };

/** `features.gem` of a catalog item. */
export type ItemGem = {
  grade: GemGrade;
  /** Kebab key of the mineral, shared by its varieties. */
  mineral: string;
  /** Gold of a carat. */
  valuePerCarat: number;
  hardness: NumberRange | null;
  specificGravity: NumberRange | null;
  /** Code as printed (V, A, R...); label `gem-luster-<code>`. */
  luster: string | null;
  /** Carats of a sphere of 1 cm. */
  caratsPerCm: number | null;
  /** Table 2-4f. */
  magic: { spells: string | null; stats: string[]; skills: string | null; other: string | null } | null;
};

/** `features.jewelry` of a catalog item. */
export type ItemJewelry = {
  /** Base value range before the class factor ("1-100+" is open ended). */
  value: { min: number; max: number; dice: string | null; openEnded: boolean };
  /** Kebab key: finger, ear, neck, head, wrist, ankle...; label `jewelry-slot-<key>`. */
  slot: string | null;
};

export const ANIMAL_STAGES = ['adult', 'young', 'egg'] as const;
export type AnimalStage = (typeof ANIMAL_STAGES)[number];

/** `features.animal` of a catalog item (also in mounts). */
export type ItemAnimal = { npcId: string | null; trained: boolean; stage: AnimalStage; domesticated: boolean };

/** `features.property` of a catalog item. Rent in gold per year. */
export type ItemProperty = { rent: number | null; size: string | null; height: string | null };

/** Size of an owned item; null is medium. */
export const ITEM_SIZES = ['small', 'medium', 'big', 'large'] as const;
export type ItemSize = (typeof ITEM_SIZES)[number];

export const JEWELRY_CLASSES = ['junk', 'costume', 'quality', 'fine', 'extravagant'] as const;
export type JewelryClass = (typeof JEWELRY_CLASSES)[number];

/** Optional multipliers of a modern cut of a gem. */
export const GEM_CUT_FACTORS = [1, 5, 10] as const;

/** Categories whose items the market sells in other sizes. */
export const SIZED_CATEGORIES = ['weapon', 'armor', 'shield', 'clothes', 'jewelry'] as const;

/** Instance data of a purchase: size, carats and cut of a gem, class and base value of a jewel. */
export type PurchaseItemOptions = {
  size?: ItemSize | null;
  carats?: number | null;
  cutFactor?: number | null;
  jewelryClass?: JewelryClass | null;
  /** Jewelry: base value before the class factor; the server rolls it in the range of the type when missing. */
  value?: number | null;
};

// Herbs in play (spec 062 §4)

/** `POST v1/characters/:id/herb-uses`. Without a roll the server rolls the hits in the range of the herb. */
export type UseHerbDto = { itemId: string; roll?: number };

/** What a herb use answers: hits healed, the hits of the character and the item (null once the last dose is gone). */
export type UseHerbResult = {
  healed: number;
  hp: { current: number; max: number };
  item: StrategicItem | null;
};

export const HERB_SEARCH_SKILLS = ['perception', 'survival'] as const;
export type HerbSearchSkill = (typeof HERB_SEARCH_SKILLS)[number];

/** `POST v1/characters/:id/herb-searches`: an absolute maneuver for each herb sought (Treasure Law 2.3). */
export type HerbSearchDto = {
  biome: HerbBiome;
  highAltitude: boolean;
  herbItemTypeIds: string[];
  skillId: HerbSearchSkill;
  specialization?: string;
  roll: number;
  unmodifiedRoll?: number;
  bonus?: number;
  /** Complementary skills (Herbalism, Region Lore) and any other modifier. */
  modifiers?: RollModifier[];
  previousSearches: number;
  familiar: boolean;
};

export const HERB_SEARCH_RESULTS = ['found', 'not-found', 'absolute-failure', 'not-here'] as const;
export type HerbSearchOutcome = (typeof HERB_SEARCH_RESULTS)[number];

/** The result of one herb. `doses` is 1d10 + 1 per full 10 over 100; `doseRoll` is that d10. */
export type HerbSearchEntry = {
  itemTypeId: string;
  /** Find difficulty of the herb. */
  difficulty: number;
  total: number | null;
  result: HerbSearchOutcome;
  doses: number;
  doseRoll?: number | null;
  /** Penalties of this herb: repeated search and several herbs. */
  modifiers?: RollModifier[];
};

export type HerbSearchResult = {
  results: HerbSearchEntry[];
  /** Hours the search takes (10, halved when familiar); the campaign clock is not advanced. */
  hours: number;
  /** The items the doses were added as. */
  items?: StrategicItem[];
};

/** `POST v1/actor-rounds/:id/herbs` in the tactical module. */
export type UseActorHerbDto = { itemId: string; roll?: number };

/** What a tactical herb use answers; the actor round type lives in the tactical MFE. */
export type ActorHerbResult<T = unknown> = {
  actorRound: T;
  healed?: number;
  stunRemoved?: number;
};

/** Bonuses of a treatment with a specific herb (spec 062). */
export type TreatmentHerb = {
  itemId?: string;
  itemTypeId?: string;
  name?: string;
  medicineBonus: number;
  recoveryBonus: number;
};

// Taxes (Treasure Law table 2-2i), a reference table of rmu-api-core.

/** One tax or toll; cost in gold, null when it is not a fixed amount. */
export type TaxRow = { key: string; cost: number | null; unit: string | null; notes?: string | null };

/** The herbs a character carries whose effects heal hits. */
export const isHealingHerb = (item: Pick<StrategicItem, 'category' | 'catalog'>): boolean =>
  item.category === 'herb' && !!item.catalog?.features?.herb?.effects?.heal;

/** Whether a herb treats an injury of that type. */
export const herbTreats = (herb: ItemHerb | null | undefined, type: InjuryType): boolean => {
  const treats = herb?.effects?.treats ?? [];
  return treats.includes(ANY_INJURY) || treats.includes(type);
};
