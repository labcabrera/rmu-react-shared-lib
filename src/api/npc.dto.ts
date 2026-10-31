import { AccessType } from './common.dto';

// The NPC of rmu-api-npcs (workspace spec 054): the Combat Stat Block of a creature plus ownership. The constants
// mirror the enums of the API (`npc-types.vo.ts`).

/** Creature categories; `other` keeps NPCs that fit none of them. */
export const NPC_CATEGORIES = [
  'animal',
  'artificial',
  'elemental',
  'extra-planar',
  'fell',
  'fey',
  'monster',
  'plant',
  'race',
  'undead',
  'other',
] as const;
export type NpcCategory = (typeof NPC_CATEGORIES)[number];

export const NPC_OUTLOOK_TYPES = [
  'aggressive',
  'aloof',
  'altruistic',
  'belligerent',
  'berserk',
  'carefree',
  'considerate',
  'cruel',
  'crusading',
  'dominant',
  'friendly',
  'greedy',
  'helpful',
  'hidden-agenda',
  'hostile',
  'hungry',
  'hunting',
  'inconsiderate',
  'inquisitive',
  'jumpy',
  'normal',
  'obsessive',
  'open',
  'passive',
  'playful',
  'protective',
  'secretive',
  'timid',
] as const;
export type NpcOutlookType = (typeof NPC_OUTLOOK_TYPES)[number];

export const NPC_ARCHETYPES = [
  'offensive',
  'defensive',
  'stealth',
  'skill',
  'discipline',
  'spell-user',
  'semi-spell-user',
  'hybrid-spell-user',
] as const;
export type NpcArchetype = (typeof NPC_ARCHETYPES)[number];

export const NPC_LEVEL_SPREADS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export type NpcLevelSpread = (typeof NPC_LEVEL_SPREADS)[number];

export const NPC_MOVEMENT_MODES = [
  'walk',
  'walk-quadruped',
  'walk-multi',
  'wings',
  'wings-gliding',
  'magic-flight',
  'swim',
  'leap',
  'climb-claw',
  'climb-snake',
  'climb-grip',
  'climb-adhesive',
  'climb-cling',
  'burrow',
  'other',
] as const;
export type NpcMovementMode = (typeof NPC_MOVEMENT_MODES)[number];

export const NPC_PACES = ['walk', 'jog', 'run', 'sprint', 'dash'] as const;
export type NpcPace = (typeof NPC_PACES)[number];

export const NPC_TIERS = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const;
export type NpcTier = (typeof NPC_TIERS)[number];

/** Size categories in order: the index + 1 is the size class (medium = 5). Same ids as core. */
export const CREATURE_SIZES = [
  'minuscule',
  'diminutive',
  'tiny',
  'small',
  'medium',
  'big',
  'large',
  'huge',
  'gigantic',
  'enormous',
  'immense',
  'behemoth',
  'leviathan',
] as const;
export type CreatureSize = (typeof CREATURE_SIZES)[number];

/** Letters of the size classes in the attack notation, by size class - 1. */
export const CREATURE_SIZE_LETTERS = ['MI', 'D', 'T', 'S', 'M', 'B', 'L', 'H', 'G', 'E', 'I', 'O', 'V'] as const;

/** Half damage and no critical from that kind of attack. */
export const NPC_CRITICAL_IMMUNITIES = [
  'no-grapple',
  'no-krush',
  'no-puncture',
  'no-slash',
  'no-strike',
  'no-unbalance',
] as const;
export type NpcCriticalImmunity = (typeof NPC_CRITICAL_IMMUNITIES)[number];

/** Biome and location codes. */
export const NPC_BIOMES = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'O',
  'P',
  'R',
  'S',
  'T',
  'U',
  'V',
  'X',
  'Z',
] as const;
export type NpcBiomeBase = (typeof NPC_BIOMES)[number];
/** A lower-case `w` after a code is a body of water within that biome (`Fw`). */
export type NpcBiome = NpcBiomeBase | `${NpcBiomeBase}w`;
export const NPC_BIOME_CODES: readonly NpcBiome[] = [...NPC_BIOMES, ...NPC_BIOMES.map((code) => `${code}w` as const)];

/** Additional critical types of the attacks (`[Krush]`), stored by name, with the critical code of each. */
export const NPC_ADDITIONAL_CRITICALS: Readonly<Record<string, string>> = {
  cold: 'O',
  electricity: 'L',
  grapple: 'G',
  heat: 'H',
  impact: 'I',
  krush: 'K',
  puncture: 'P',
  slash: 'S',
  strikes: 'T',
  sweeps: 'W',
  unbalance: 'U',
  acid: 'acid',
  holy: 'holy',
  steam: 'steam',
  subdual: 'subdual',
};

export interface NpcMovement {
  mode: NpcMovementMode;
  tier: NpcTier | null;
  /** Base movement rate, feet per round. */
  baseRate: number;
  maxPace: NpcPace;
  note: string | null;
}

export interface NpcCriticalCodes {
  /** `I`: every critical is one severity lower. */
  reduceSeverity: boolean;
  /** `!`: cannot be staggered, knocked back or down. */
  noKnockdown: boolean;
  /** `@`: immune to stun. */
  stunImmune: boolean;
  /** `#`: immune to bleeding. */
  bleedImmune: boolean;
  immunities: NpcCriticalImmunity[];
}

/** Running ranks (passive dodge) and the total Running bonus. */
export interface NpcRunning {
  ranks: number;
  bonus: number;
}

/** Shield types of Core Law Table 9-6, the letter of the stat block (`T`, `N`, `F`, `W`). */
export const NPC_SHIELD_TYPES = ['target', 'normal', 'full', 'wall'] as const;
export type NpcShieldType = (typeof NPC_SHIELD_TYPES)[number];

/** DB each shield type adds (Table 9-6): the npcs API takes it when a shield is sent without `db`. */
export const NPC_SHIELD_TYPE_DB: Readonly<Record<NpcShieldType, number>> = {
  target: 15,
  normal: 20,
  full: 25,
  wall: 30,
};

/**
 * `(N20+8/+60)` (ADR 0010): the shield type, the DB the shield adds (not part of `db` of the stat block), and the
 * Shield skill of the creature, its ranks and total bonus (null when the stat block gives only the type). `db` is
 * missing in NPCs stored before spec 056 and optional when sending: the DB of the type.
 */
export interface NpcShield {
  type: NpcShieldType;
  db?: number | null;
  ranks: number | null;
  bonus: number | null;
}

/** The DB of a shield: its own, or the one of its type. */
export const npcShieldDb = (shield: NpcShield): number => shield.db ?? NPC_SHIELD_TYPE_DB[shield.type] ?? 0;

export interface NpcPoison {
  type: string | null;
  rrModifier: number | null;
}

export interface NpcAttack {
  ob: number;
  /** Size class of the attack, 1-13 (medium = 5). */
  size: number;
  /** Attack table id of rmu-api-attack-tables. */
  attackTable: string;
  fumbleTable: string | null;
  /** Critical type of the additional critical (a key of NPC_ADDITIONAL_CRITICALS). */
  additionalCritical: string | null;
  /** `>` (single) or `>>` (double). */
  sequence: 'single' | 'double' | null;
  /** Creatures needed for a cooperative attack. */
  cooperation: number | null;
  /** Number of attacks of the kata. */
  kata: number | null;
  /** Index of the attack this one is an alternative of. */
  alternativeTo: number | null;
  poison: NpcPoison | null;
  hand: 'left' | null;
  /** The notation as printed. */
  notation: string | null;
}

export interface NpcSkill {
  skillId: string;
  specialization: string | null;
  ranks: number | null;
  /** Total bonus. */
  bonus: number;
  note: string | null;
}

export interface NpcResistances {
  channeling: number;
  essence: number;
  mentalism: number;
  physical: number;
  fear: number;
}

export const NPC_RESISTANCES = ['channeling', 'essence', 'mentalism', 'physical', 'fear'] as const;

export interface NpcStats {
  ag: number;
  co: number;
  em: number;
  in: number;
  me: number;
  pr: number;
  qu: number;
  re: number;
  sd: number;
  st: number;
}

export interface NpcEncounter {
  /** Group name (`Solo`, `Pack`…). */
  group: string;
  /** Random number (`1d2`). */
  dice: string | null;
  biomes: NpcBiome[];
  /** Frequency difficulty modifier. */
  frequency: number | null;
}

export interface NpcDetails {
  variants: string | null;
  height: string | null;
  armorDescription: string | null;
  treasure: string | null;
  magicRealm: string | null;
  misc: string | null;
}

/** Informational only: no rule applies it yet. */
export interface NpcTalent {
  name: string;
  tier: string | null;
  params: string | null;
  dp: number | null;
}

export interface NpcItem {
  name: string;
  itemTypeId: string | null;
  amount: number;
}

/** Read only: set by the import of the book data. */
export interface NpcSource {
  book: string;
  key: string;
  page: number | null;
}

export interface Npc {
  id: string;
  /** Version of optimistic concurrency: send it back in the PATCH. */
  version: number;
  realmId: string;
  /** Public NPCs are the catalog (admin only); the rest are private to their owner. */
  accessType: AccessType;
  name: string;
  category: NpcCategory;
  /** Book section (`carnivore`, `water`…). */
  type: string | null;
  /** Group of the section (`bears`…). */
  group: string | null;
  level: number;
  levelSpread: NpcLevelSpread | null;
  outlookType: NpcOutlookType | null;
  archetype: NpcArchetype | null;
  movement: NpcMovement[];
  endurance: number | null;
  size: CreatureSize;
  /** Size used for criticals, when it differs from the size. */
  criticalSize: CreatureSize | null;
  criticalCodes: NpcCriticalCodes;
  hp: number;
  /** Hit total at which the creature dies. */
  deathHits: number | null;
  at: number;
  db: number;
  running: NpcRunning | null;
  shield: NpcShield | null;
  initiative: number;
  attacks: NpcAttack[];
  powerPoints: number | null;
  resistances: NpcResistances | null;
  skills: NpcSkill[];
  encounter: NpcEncounter | null;
  stats: NpcStats | null;
  details: NpcDetails | null;
  talents: NpcTalent[];
  items: NpcItem[];
  source: NpcSource | null;
  description: string | null;
  imageUrl: string | null;
  owner: string;
  createdAt: string;
  updatedAt: string | null;
}

/** The combat stat block of an NPC, what CreatureStatBlock shows. */
export type NpcStatBlock = Pick<
  Npc,
  | 'level'
  | 'levelSpread'
  | 'outlookType'
  | 'archetype'
  | 'movement'
  | 'endurance'
  | 'size'
  | 'criticalSize'
  | 'criticalCodes'
  | 'hp'
  | 'deathHits'
  | 'at'
  | 'db'
  | 'running'
  | 'shield'
  | 'initiative'
  | 'attacks'
  | 'powerPoints'
  | 'resistances'
  | 'skills'
  | 'encounter'
>;

/** The fields of a creation; `source` is set only by the import, `accessType` public only by an admin. */
export type CreateNpcDto = Partial<Omit<Npc, 'id' | 'version' | 'owner' | 'source' | 'createdAt' | 'updatedAt'>> &
  Pick<Npc, 'realmId' | 'name' | 'category' | 'level' | 'size' | 'hp' | 'at' | 'db' | 'initiative'>;

/** A partial change: lists replace the stored ones whole; `version` makes a stale change a 409. */
export type UpdateNpcDto = Partial<Omit<CreateNpcDto, 'realmId'>> & { version?: number };

/** Size class (1-13) of a creature size. */
export const creatureSizeClass = (size: CreatureSize | string | null | undefined): number | null => {
  const index = CREATURE_SIZES.indexOf(size as CreatureSize);
  return index < 0 ? null : index + 1;
};

/** Short attack-table abbreviations of the stat block notation; other tables show their id. */
const ATTACK_ABBREVIATIONS: Readonly<Record<string, string>> = {
  beak: 'be',
  bite: 'bi',
  claw: 'cl',
  club: 'cu',
  crush: 'cr',
  grapple: 'gr',
  horn: 'ho',
  ram: 'ra',
  stinger: 'si',
  trample: 'tr',
  'unarmed-strikes': 'un',
  'unarmed-sweeps': 'sw',
  'lightning-bolt': 'lbo',
  'fire-bolt': 'fbo',
  'ice-bolt': 'ibo',
  'water-bolt': 'wbo',
  'cold-ball': 'cba',
  'fire-ball': 'fba',
  'lightning-ball': 'lba',
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * The stat block notation of an attack built from its fields: `<OB><size letter>(<size class>)<table>` plus the
 * additions (`[Krush]`, `>`, `Coop10`, `(2WF)`, `(Left)`, poison). A preview: the stored `notation` is the printed one.
 */
export const npcAttackNotation = (attack: Partial<NpcAttack>): string => {
  const size = attack.size ?? 5;
  const letter = CREATURE_SIZE_LETTERS[size - 1] ?? '?';
  const table = attack.attackTable ? (ATTACK_ABBREVIATIONS[attack.attackTable] ?? attack.attackTable) : '?';
  const parts = [`${attack.ob ?? 0}${letter}(${size})${table}`];
  if (attack.additionalCritical) parts.push(`[${capitalize(attack.additionalCritical)}]`);
  if (attack.sequence) parts.push(attack.sequence === 'double' ? '>>' : '>');
  if (attack.cooperation) parts.push(`(Coop${attack.cooperation})`);
  if (attack.kata) parts.push(`(${attack.kata}WF)`);
  if (attack.hand === 'left') parts.push('(Left)');
  let notation = parts.join('');
  if (attack.poison) {
    const poison = ['Poison', attack.poison.type && capitalize(attack.poison.type), attack.poison.rrModifier]
      .filter((each) => each !== null && each !== undefined && each !== '')
      .join(', ');
    notation += ` [${poison}]`;
  }
  return notation;
};
