import type { SpellAlchemyEffect } from '../../api/enchantment.dto';
import type { ItemFeatureTranslate } from '../item/ItemFeatureChips';

/** The value of an alchemy effect: a signed bonus, or a multiplier of power points. */
export const alchemyEffectValue = (effect: Pick<SpellAlchemyEffect, 'kind' | 'value'>): string => {
  if (effect.kind === 'pp-multiplier') return `×${effect.value}`;
  return effect.value >= 0 ? `+${effect.value}` : `${effect.value}`;
};

/** "Attack bonus +5", "Power point multiplier ×2"… */
export const alchemyEffectText = (
  effect: Pick<SpellAlchemyEffect, 'kind' | 'value'>,
  t: ItemFeatureTranslate
): string => `${t(`alchemy-effect-${effect.kind}`)} ${alchemyEffectValue(effect)}`;
