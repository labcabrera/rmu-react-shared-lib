import React, { ReactElement } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BoltIcon from '@mui/icons-material/Bolt';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PanToolIcon from '@mui/icons-material/PanTool';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Theme } from '@mui/material';
import { gameColors } from '../../theme/tokens';

/** Action types of the combat dashboard, as the tactical API names them. */
export type CombatActionType =
  | 'melee_attack'
  | 'ranged_attack'
  | 'movement'
  | 'maneuver'
  | 'cast_spell'
  | 'cast_instant'
  | 'dodge'
  | 'stand_up'
  | 'draw_and_load'
  | 'perception'
  | 'medical'
  | 'other';

/** Groups of action types: each has a color in `palette.combat`. */
export type CombatActionCategory = 'melee' | 'ranged' | 'movement' | 'maneuver' | 'spell' | 'other';

/** State of an action as the board shows it. */
export type CombatActionState = 'pending' | 'waiting' | 'resolved' | 'failed';

type ActionTypeInfo = {
  category: CombatActionCategory;
  /** Translation key of the type's name. */
  labelKey: string;
  icon: () => ReactElement;
};

export const combatActionTypes: Record<CombatActionType, ActionTypeInfo> = {
  melee_attack: { category: 'melee', labelKey: 'melee_attack', icon: () => <SportsMartialArtsIcon /> },
  ranged_attack: { category: 'ranged', labelKey: 'ranged_attack', icon: () => <GpsFixedIcon /> },
  movement: { category: 'movement', labelKey: 'movement', icon: () => <DirectionsRunIcon /> },
  maneuver: { category: 'maneuver', labelKey: 'maneuver', icon: () => <ShuffleIcon /> },
  cast_spell: { category: 'spell', labelKey: 'spell', icon: () => <AutoFixHighIcon /> },
  cast_instant: { category: 'spell', labelKey: 'instant-spell', icon: () => <BoltIcon /> },
  dodge: { category: 'maneuver', labelKey: 'dodge', icon: () => <SwapHorizIcon /> },
  stand_up: { category: 'movement', labelKey: 'stand-up', icon: () => <ArrowUpwardIcon /> },
  draw_and_load: { category: 'other', labelKey: 'draw-and-load', icon: () => <PanToolIcon /> },
  perception: { category: 'maneuver', labelKey: 'perception', icon: () => <VisibilityIcon /> },
  medical: { category: 'maneuver', labelKey: 'medical', icon: () => <MedicalServicesIcon /> },
  other: { category: 'other', labelKey: 'other', icon: () => <MoreHorizIcon /> },
};

const fallback: ActionTypeInfo = combatActionTypes.other;

/** Category, label key and icon of an action type; unknown types fall back to `other`. */
export const combatActionInfo = (type: string): ActionTypeInfo =>
  combatActionTypes[type as CombatActionType] ?? fallback;

/**
 * Combat colors of the theme. A remote can be newer than the shell that builds the theme: when the theme has
 * no `palette.combat`, the default colors of its mode are used instead of failing.
 */
export const combatColors = (theme: Theme): Theme['palette']['combat'] =>
  theme.palette.combat ?? gameColors[theme.palette.mode].combat;

/**
 * Color of a faction by its position in the game (`game.factions`), cycling when there are more factions than
 * colors. Unknown factions (index -1) get the last, neutral color.
 */
export const factionColor = (theme: Theme, index: number): string => {
  const colors = theme.palette.factions ?? gameColors[theme.palette.mode].factions;
  if (index < 0) return colors[colors.length - 1];
  return colors[index % (colors.length - 1)];
};
