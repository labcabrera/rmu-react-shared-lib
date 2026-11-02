import type { SpellAlchemyEffect } from '../../api/enchantment.dto';
import type { ItemFeatureTranslate } from '../item/ItemFeatureChips';

/** The value of an alchemy effect: a signed bonus, or a multiplier of power points. */
export const alchemyEffectValue = (effect: { kind: SpellAlchemyEffect['kind'] | string; value: number }): string => {
  if (effect.kind === 'pp-multiplier') return `×${effect.value}`;
  return effect.value >= 0 ? `+${effect.value}` : `${effect.value}`;
};

/** "Attack bonus +5", "Power point multiplier ×2"… */
export const alchemyEffectText = (
  effect: { kind: SpellAlchemyEffect['kind'] | string; value: number },
  t: ItemFeatureTranslate
): string => `${t(`alchemy-effect-${effect.kind}`)} ${alchemyEffectValue(effect)}`;
