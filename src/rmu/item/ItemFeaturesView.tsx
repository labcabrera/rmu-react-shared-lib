import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { ItemFeatures } from '../../api/item.dto';
import { ALL_STUN_ROUNDS, difficultyCodeKey, NumberRange } from '../../api/treasure-goods.dto';
import KeyValuePanel, { KeyValueRow } from '../../display/KeyValuePanel';
import { ItemFeatureTranslate, moneyText } from './ItemFeatureChips';

export type ItemFeatureSection = { key: string; title: string; rows: KeyValueRow[] };

const range = (value: NumberRange | null | undefined): string =>
  !value ? '-' : value.min === value.max ? `${value.min}` : `${value.min}-${value.max}`;

const signed = (value: number): string => (value > 0 ? `+${value}` : `${value}`);

const yesNo = (value: boolean, t: ItemFeatureTranslate) => t(value ? 'yes' : 'no');

const optional = (label: string, value: string | number | null | undefined): KeyValueRow[] =>
  value === null || value === undefined || value === '' ? [] : [{ label, value }];

/** Label of a biome code (`npc-biome-<code>`). */
const biome = (code: string, t: ItemFeatureTranslate) => t(`npc-biome-${code}`, { defaultValue: code });

/**
 * The panels of the Treasure Law blocks of an item (spec 062): herb, acid, intoxicant, gem, jewelry, animal and
 * property, with their rows translated. Only the blocks it has; the effect text stays in the description.
 */
export const itemFeatureSections = (
  features: ItemFeatures | null | undefined,
  t: ItemFeatureTranslate
): ItemFeatureSection[] => {
  if (!features) return [];
  const sections: ItemFeatureSection[] = [];
  const { herb, acid, intoxicant, gem, jewelry, animal, property } = features;
  if (herb) {
    const effects = herb.effects;
    sections.push({
      key: 'herb',
      title: t('item-category-herb'),
      rows: [
        { label: t('herb-group'), value: t(`herb-group-${herb.group}`) },
        { label: t('npc-biomes'), value: herb.biomes.map((code) => biome(code, t)).join(', ') || '-' },
        { label: t('herb-high-altitude'), value: yesNo(herb.highAltitude, t) },
        { label: t('herb-find'), value: t(difficultyCodeKey(herb.find)) },
        { label: t('herb-form'), value: herb.form ? t(`herb-form-${herb.form}`, { defaultValue: herb.form }) : '-' },
        { label: t('herb-prep'), value: t(`herb-prep-${herb.prep}`) },
        ...optional(t('herb-season'), herb.season),
        { label: t('herb-effect-delay'), value: t(`herb-effect-delay-${herb.effectDelay}`) },
        { label: t('herb-magical'), value: yesNo(herb.magical, t) },
        ...optional(t('addiction-factor'), herb.addictionFactor === null ? null : signed(herb.addictionFactor)),
        ...(effects?.heal ? [{ label: t('herb-heal'), value: range(effects.heal) }] : []),
        ...(effects?.stunRelief
          ? [
              {
                label: t('herb-stun-relief'),
                value: effects.stunRelief >= ALL_STUN_ROUNDS ? t('herb-stun-relief-all') : effects.stunRelief,
              },
            ]
          : []),
        ...(effects?.treats?.length
          ? [
              {
                label: t('herb-treats'),
                value: effects.treats
                  .map((type) => t(type === 'any' ? 'herb-treats-any' : `injury-type-${type}`))
                  .join(', '),
              },
            ]
          : []),
        ...optional(t('herb-recovery-bonus'), effects?.recoveryBonus ? signed(effects.recoveryBonus) : null),
      ],
    });
  }
  if (acid) {
    sections.push({
      key: 'acid',
      title: t('item-category-acid'),
      rows: [
        { label: t('acid-strength'), value: t(`acid-strength-${acid.strength}`) },
        {
          label: t('acid-splash'),
          value: acid.splash
            ? `${acid.splash.severity}${acid.splash.modifier ? signed(acid.splash.modifier) : ''}`
            : '-',
        },
        {
          label: t('acid-immersion'),
          value: acid.immersion
            ? t('acid-immersion-value', {
                count: acid.immersion.count,
                severity: acid.immersion.severity,
                rounds: acid.immersion.everyRounds,
              })
            : '-',
        },
        {
          label: t('acid-ingestion'),
          value: acid.ingestion
            ? t('acid-ingestion-value', {
                level: acid.ingestion.level,
                penalty: acid.ingestion.penalty,
                per: acid.ingestion.perFailure,
              })
            : '-',
        },
        { label: t('acid-breakage-mod'), value: signed(acid.breakageMod) },
        { label: t('acid-craft-difficulty'), value: t(difficultyCodeKey(acid.craftDifficulty)) },
        { label: t('acid-targets'), value: t(`acid-targets-${acid.targets}`) },
      ],
    });
  }
  if (intoxicant) {
    sections.push({
      key: 'intoxicant',
      title: t('item-category-intoxicant'),
      rows: [
        {
          label: t('addiction-factor'),
          value: intoxicant.addictionFactor === null ? '-' : signed(intoxicant.addictionFactor),
        },
        ...optional(
          t('herb-form'),
          intoxicant.form ? t(`herb-form-${intoxicant.form}`, { defaultValue: intoxicant.form }) : null
        ),
        ...optional(t('herb-prep'), intoxicant.prep ? t(`herb-prep-${intoxicant.prep}`) : null),
      ],
    });
  }
  if (gem) {
    const magic = gem.magic;
    sections.push({
      key: 'gem',
      title: t('item-category-gem'),
      rows: [
        { label: t('gem-grade'), value: t(`gem-grade-${gem.grade}`) },
        { label: t('gem-mineral'), value: t(`gem-mineral-${gem.mineral}`, { defaultValue: gem.mineral }) },
        { label: t('gem-value-per-carat'), value: moneyText(gem.valuePerCarat, t) },
        { label: t('gem-hardness'), value: range(gem.hardness) },
        { label: t('gem-specific-gravity'), value: range(gem.specificGravity) },
        ...optional(t('gem-luster'), gem.luster ? t(`gem-luster-${gem.luster}`, { defaultValue: gem.luster }) : null),
        ...optional(t('gem-carats-per-cm'), gem.caratsPerCm),
        ...optional(t('gem-magic-spells'), magic?.spells),
        ...optional(t('gem-magic-stats'), magic?.stats.length ? magic.stats.map((stat) => t(stat)).join(', ') : null),
        ...optional(t('gem-magic-skills'), magic?.skills),
        ...optional(t('gem-magic-other'), magic?.other),
      ],
    });
  }
  if (jewelry) {
    const value = jewelry.value;
    sections.push({
      key: 'jewelry',
      title: t('item-category-jewelry'),
      rows: [
        {
          label: t('jewelry-base-value'),
          value: `${value.dice ? `${value.dice} · ` : ''}${value.min}-${value.max}${value.openEnded ? '+' : ''}`,
          hint: t('jewelry-base-value-hint'),
        },
        ...optional(t('slot'), jewelry.slot ? t(`jewelry-slot-${jewelry.slot}`, { defaultValue: jewelry.slot }) : null),
      ],
    });
  }
  if (animal) {
    sections.push({
      key: 'animal',
      title: t('item-category-animal'),
      rows: [
        { label: t('animal-stage'), value: t(`animal-stage-${animal.stage}`) },
        { label: t('animal-trained'), value: yesNo(animal.trained, t) },
        { label: t('animal-domesticated'), value: yesNo(animal.domesticated, t) },
        ...optional(t('animal-creature'), animal.npcId ? t(animal.npcId, { defaultValue: animal.npcId }) : null),
      ],
    });
  }
  if (property) {
    sections.push({
      key: 'property',
      title: t('item-category-property'),
      rows: [
        { label: t('property-rent'), value: property.rent ? moneyText(property.rent, t) : '-' },
        ...optional(t('property-size'), property.size),
        ...optional(t('property-height'), property.height),
      ],
    });
  }
  return sections;
};

/** The Treasure Law blocks of an item as panels (spec 062); nothing when it has none. */
const ItemFeaturesView: FC<{ features: ItemFeatures | null | undefined }> = ({ features }) => {
  const { t } = useTranslation();
  const sections = itemFeatureSections(features, t);
  if (sections.length === 0) return null;
  return (
    <Grid container spacing={2}>
      {sections.map((section) => (
        <Grid key={section.key} size={{ xs: 12, md: 6 }}>
          <KeyValuePanel title={section.title} rows={section.rows} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ItemFeaturesView;
