import { SpellArea, SpellDuration, SpellRange } from '../../api/spell.dto';

/** The `t` of react-i18next, reduced to what the formatters use. */
export type SpellTranslate = (key: string, options?: Record<string, unknown>) => string;

const amount = (value: number | null, scale: string | null, t: SpellTranslate): string | null => {
  if (value === null || value === undefined) return null;
  return scale ? `${value} ${t(`spell-scale-${scale}`, { count: value })}` : `${value}`;
};

/** Suffix of a value that scales with the caster level: `/lvl`, `/5 lvl`. */
export const spellPerLevelSuffix = (levels: number | null | undefined, t: SpellTranslate): string =>
  t('spell-per-level', { count: levels || 1 });

/**
 * Short text of a spell duration (spec 028) from its structured fields: `1 min/lvl`, `10 rnds/5 fail (C)`,
 * `Concentration`… Falls back to the raw text of the book when the fields do not say enough.
 */
export const spellDurationText = (duration: SpellDuration | null | undefined, t: SpellTranslate): string => {
  if (!duration) return '-';
  const raw = duration.raw || null;
  let text: string | null;
  switch (duration.type) {
    case 'instant':
      text = t('instant');
      break;
    case 'concentration':
      text = t('concentration');
      break;
    case 'permanent':
      text = t('permanent');
      break;
    case 'fixed':
      text = amount(duration.value, duration.scale, t);
      break;
    case 'per-level': {
      const base = amount(duration.value, duration.scale, t);
      text = base ? `${base}${spellPerLevelSuffix(duration.perLevel, t)}` : null;
      break;
    }
    case 'per-failure': {
      const base = amount(duration.value, duration.scale, t);
      text = base ? `${base}${t('spell-per-failure', { count: duration.perFailure || 1 })}` : null;
      break;
    }
    case 'varies':
      text = raw ?? t('spell-varies');
      break;
    case 'special':
      text = raw ?? t('spell-duration-special');
      break;
    default:
      text = null;
  }
  if (!text) return raw ?? '-';
  return duration.concentration && duration.type !== 'concentration' ? `${text} (C)` : text;
};

/** Short text of a spell range (spec 028): `Self`, `100'`, `10'/lvl`, `100' <25'>`… or the raw text of the book. */
export const spellRangeText = (range: SpellRange | null | undefined, t: SpellTranslate): string => {
  if (!range) return '-';
  const raw = range.raw || null;
  switch (range.type) {
    case 'self':
    case 'touch':
    case 'unlimited':
      return t(range.type);
    case 'sight':
      return t('spell-range-sight');
    case 'distance': {
      if (range.value === null || range.value === undefined) return raw ?? '-';
      const perLevel = range.perLevel ? spellPerLevelSuffix(1, t) : '';
      const increment = range.increment ? ` <${range.increment}'>` : '';
      return `${range.value}'${perLevel}${increment}`;
    }
    case 'varies':
      return raw ?? t('spell-varies');
    default:
      return raw ?? '-';
  }
};

/** Translated kinds of target of an area, joined. */
export const spellTargetTypesText = (types: string[] | null | undefined, t: SpellTranslate): string =>
  (types || []).map((type) => t(`spell-target-type-${type}`, { defaultValue: type })).join(', ');

/**
 * Short text of a spell area (spec 028): `Caster`, `1/lvl person`, `20' R`, a volume… or the raw text of the book
 * when the fields do not say enough.
 */
export const spellAreaText = (area: SpellArea | null | undefined, t: SpellTranslate): string => {
  if (!area) return '-';
  const raw = area.raw || null;
  const perLevel = area.perLevel ? spellPerLevelSuffix(1, t) : '';
  const types = spellTargetTypesText(area.targetTypes, t);
  let text: string | null;
  switch (area.kind) {
    case 'caster':
      text = t('spell-area-caster');
      break;
    case 'targets': {
      const count = area.count !== null && area.count !== undefined ? `${area.count}${perLevel}` : '';
      const what = types || (count ? t('spell-area-target', { count: area.count ?? 1 }) : '');
      text = [count, what].filter(Boolean).join(' ') || null;
      break;
    }
    case 'radius':
      text = area.radius !== null && area.radius !== undefined ? `${area.radius}' R${perLevel}` : null;
      break;
    case 'volume':
      // The dimensions of the book may already say they scale ("1 cu'/lvl").
      text = area.dimensions ? `${area.dimensions}${/\/\s*lvl/i.test(area.dimensions) ? '' : perLevel}` : null;
      break;
    case 'object':
      text = types || t('spell-area-object');
      break;
    case 'varies':
      text = raw ?? t('spell-varies');
      break;
    default:
      text = null;
  }
  return text || raw || '-';
};
