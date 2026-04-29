import { StatKey, Pace, EquipmentSlot } from './character.dto';
import { KeyValue } from './common.dto';
import { RealmType } from './profession.dto';

export const STATS: StatKey[] = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];

export const REALM_TYPES: RealmType[] = ['channeling', 'essence', 'mentalism'];

export const PACE_VALUES: Pace[] = ['creep', 'walk', 'jog', 'run', 'sprint', 'dash'];

export const EQUIPMENT_SLOTS: EquipmentSlot[] = ['mainHand', 'offHand', 'head', 'body', 'arms', 'legs'];

export const MANEUVER_DIFFICULTIES: KeyValue[] = [
  { key: 'c', value: 70 },
  { key: 's', value: 50 },
  { key: 'r', value: 30 },
  { key: 'e', value: 20 },
  { key: 'l', value: 10 },
  { key: 'm', value: 0 },
  { key: 'h', value: -10 },
  { key: 'vh', value: -20 },
  { key: 'xh', value: -30 },
  { key: 'sf', value: -50 },
  { key: 'a', value: -70 },
  { key: 'ni', value: -100 },
];
