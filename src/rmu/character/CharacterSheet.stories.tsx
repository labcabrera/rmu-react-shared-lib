import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Divider, Drawer, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Character, CharacterSkill, EquipmentSlot } from '../../api/character.dto';
import { EntityState } from '../../data/useEntity';
import Panel from '../../layouts/Panel';
import SectionNav, { useSectionParam } from '../../layouts/SectionNav';
import { enterSx } from '../../motion/motion';
import DetailPage from '../../templates/DetailPage';
import { sampleCharacter } from '../../test/fixtures/character';
import AttackCard from './AttackCard';
import ResistanceList from './ResistanceList';
import ResourceBar from './ResourceBar';
import SkillGroupList from './SkillGroupList';
import StatBlock, { statKeys } from './StatBlock';
import StatPill, { formatBonus } from './StatPill';

// Prototype of the character sheet of spec 004 (phase 4): hero header, overview dashboard and six
// sections. It only arranges the shared components over a fixture; the real page lives in rmu-mfe-strategic.

const sectionIds = ['overview', 'attributes', 'skills', 'combat', 'equipment', 'progression'] as const;
type SectionId = (typeof sectionIds)[number];

// Fixture equipment ids to item names (the real page reads the character's items).
const itemNames: Record<string, string> = {
  'item-sword': 'arming-sword',
  'item-shield': 'target-shield',
  'item-mail': 'brigandine-torso-armor',
  'item-helm': 'mail-helmet',
};

const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', py: 0.5, gap: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Stack>
);

/** 12-column grid; children set `gridColumn` spans per breakpoint. */
const Bento = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: 2 }}>{children}</Box>
);

const span = (md: number, lg: number, xl = lg) => ({
  gridColumn: { xs: 'span 12', sm: `span ${md}`, lg: `span ${lg}`, xl: `span ${xl}` },
});

const DefensePanel = ({ character }: { character: Character }) => {
  const { t } = useTranslation();
  const { armor, shield } = character.defense;
  return (
    <>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <StatPill label={t('db')} value={character.defense.defensiveBonus} signed />
        <StatPill label={t('at')} value={armor.at ?? '-'} />
        {shield && <StatPill label={t('shield-db')} value={shield.db} signed />}
      </Stack>
      <Row label={t('head')} value={armor.headAt ?? '-'} />
      <Row label={t('body')} value={armor.bodyAt ?? '-'} />
      <Row label={t('arms')} value={armor.armsAt ?? '-'} />
      <Row label={t('legs')} value={armor.legsAt ?? '-'} />
      {shield && <Row label={t('shield-block-count')} value={shield.blockCount} />}
    </>
  );
};

const LoadPanel = ({ character }: { character: Character }) => {
  const { t } = useTranslation();
  const { equipment } = character;
  return (
    <>
      <ResourceBar
        label={t('weight-allowance')}
        current={equipment.weight}
        max={equipment.weightAllowance}
        kind="fatigue"
      />
      <Box sx={{ mt: 1 }}>
        <Row label={t('maneuver-penalty')} value={formatBonus(equipment.maneuverPenalty)} />
        <Row label={t('ranged-penalty')} value={formatBonus(equipment.rangedPenalty)} />
        <Row label={t('encumbrance')} value={formatBonus(equipment.encumbrancePenalty)} />
      </Box>
    </>
  );
};

const Overview = ({ character, go }: { character: Character; go: (id: SectionId) => void }) => {
  const { t } = useTranslation();
  const seeAll = (id: SectionId) => ({ label: t('see-all'), onClick: () => go(id) });
  const topSkills = [...character.skills].sort((a, b) => b.totalBonus - a.totalBonus).slice(0, 6);
  return (
    <Bento>
      <Box sx={span(12, 8)}>
        <Panel title={t('statistics')} action={seeAll('attributes')}>
          <StatBlock statistics={character.statistics} />
        </Panel>
      </Box>
      <Box sx={span(6, 4)}>
        <Panel title={t('resistances')} action={seeAll('attributes')}>
          <ResistanceList resistances={character.resistances} />
        </Panel>
      </Box>
      <Box sx={span(6, 4, 3)}>
        <Panel title={t('defense')} action={seeAll('combat')}>
          <DefensePanel character={character} />
        </Panel>
      </Box>
      <Box sx={span(12, 8, 9)}>
        <Panel title={t('attacks')} action={seeAll('combat')}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1.5 }}>
            {character.attacks.map((attack) => (
              <AttackCard key={attack.attackName} attack={attack} dense />
            ))}
          </Box>
        </Panel>
      </Box>
      <Box sx={span(6, 6)}>
        <Panel title={t('top-skills')} action={seeAll('skills')}>
          {topSkills.map((skill) => (
            <Row
              key={skill.id}
              label={skill.specialization ? `${t(skill.skillId)} (${skill.specialization})` : t(skill.skillId)}
              value={formatBonus(skill.totalBonus)}
            />
          ))}
        </Panel>
      </Box>
      <Box sx={span(6, 3)}>
        <Panel title={t('equipment')} action={seeAll('equipment')}>
          <LoadPanel character={character} />
        </Panel>
      </Box>
      <Box sx={span(12, 3)}>
        <Panel title={t('traits')} action={seeAll('attributes')}>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {character.traits.map((trait) => (
              <Chip
                key={`${trait.traitId}-${trait.specialization ?? ''}`}
                label={trait.specialization ? `${t(trait.traitName)} (${trait.specialization})` : t(trait.traitName)}
                color={trait.isTalent ? 'primary' : 'default'}
                variant={trait.isTalent ? 'outlined' : 'filled'}
              />
            ))}
          </Stack>
        </Panel>
      </Box>
    </Bento>
  );
};

const Attributes = ({ character }: { character: Character }) => {
  const { t } = useTranslation();
  return (
    <Bento>
      <Box sx={span(12, 8)}>
        <Panel title={t('statistics')}>
          <Box sx={{ overflowX: 'auto' }}>
            <Box
              component="table"
              sx={{ width: '100%', borderCollapse: 'collapse', '& td, & th': { py: 0.75, px: 1, textAlign: 'right' } }}
            >
              <thead>
                <Box component="tr" sx={{ color: 'text.secondary', typography: 'caption' }}>
                  <Box component="th" sx={{ textAlign: 'left !important' }}>
                    {t('stat')}
                  </Box>
                  <th>{t('temporary-short')}</th>
                  <th>{t('potential-short')}</th>
                  <th>{t('total-short')}</th>
                </Box>
              </thead>
              <tbody>
                {statKeys.map((key) => {
                  const stat = character.statistics[key];
                  return (
                    <Box component="tr" key={key} sx={{ borderTop: 1, borderColor: 'divider', typography: 'body2' }}>
                      <Box component="td" sx={{ textAlign: 'left !important' }}>
                        {t(key)}
                      </Box>
                      <td>{stat.temporary}</td>
                      <td>{stat.potential}</td>
                      <Box component="td" sx={{ fontWeight: 700 }}>
                        {formatBonus(stat.totalBonus)}
                      </Box>
                    </Box>
                  );
                })}
              </tbody>
            </Box>
          </Box>
        </Panel>
      </Box>
      <Box sx={span(12, 4)}>
        <Stack spacing={2}>
          <Panel title={t('resistances')}>
            <ResistanceList resistances={character.resistances} />
          </Panel>
          <Panel title={t('traits')}>
            {character.traits.map((trait) => (
              <Row key={trait.traitId} label={t(trait.traitName)} value={trait.cost} />
            ))}
          </Panel>
        </Stack>
      </Box>
    </Bento>
  );
};

const SkillDrawer = ({ skill, onClose }: { skill: CharacterSkill | null; onClose: () => void }) => {
  const { t } = useTranslation();
  return (
    <Drawer anchor="right" open={Boolean(skill)} onClose={onClose}>
      {skill && (
        <Box sx={{ width: { xs: '100vw', sm: 360 }, p: 3 }}>
          <Typography variant="overline" color="text.secondary">
            {t(skill.category ?? 'skill')}
          </Typography>
          <Typography variant="h5">{t(skill.skillId)}</Typography>
          {skill.specialization && <Typography color="text.secondary">{skill.specialization}</Typography>}
          <Divider sx={{ my: 2 }} />
          <Row label={t('ranks')} value={skill.ranks} />
          <Row label={t('stats')} value={skill.statistics.map((s) => s.toUpperCase()).join('/')} />
          <Row label={t('stat')} value={formatBonus(skill.statBonus)} />
          <Row label={t('racial')} value={formatBonus(skill.racialBonus)} />
          <Row label={t('profession')} value={formatBonus(skill.professionalBonus)} />
          <Row label={t('ranks')} value={formatBonus(skill.developmentBonus)} />
          <Row label={t('custom')} value={formatBonus(skill.customBonus)} />
          <Divider sx={{ my: 1 }} />
          <Row label={t('total')} value={formatBonus(skill.totalBonus)} />
        </Box>
      )}
    </Drawer>
  );
};

const Skills = ({ character }: { character: Character }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<CharacterSkill | null>(null);
  const { experience } = character;
  return (
    <Stack spacing={2}>
      <Box sx={{ maxWidth: 360 }}>
        <ResourceBar
          label={t('dev-points')}
          current={experience.availableDevPoints}
          max={experience.devPoints}
          kind="xp"
        />
      </Box>
      <SkillGroupList skills={character.skills} onSelect={setSelected} />
      <SkillDrawer skill={selected} onClose={() => setSelected(null)} />
    </Stack>
  );
};

const Combat = ({ character }: { character: Character }) => {
  const { t } = useTranslation();
  return (
    <Bento>
      <Box sx={span(12, 8, 9)}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
          {character.attacks.map((attack) => (
            <AttackCard key={attack.attackName} attack={attack} />
          ))}
        </Box>
      </Box>
      <Box sx={span(12, 4, 3)}>
        <Stack spacing={2}>
          <Panel title={t('defense')}>
            <DefensePanel character={character} />
          </Panel>
          <Panel title={t('movement')}>
            <Row label={t('bmr')} value={character.movement.baseMovementRate} />
            <Row label={t('max-pace')} value={t(character.movement.maxPace)} />
            <Row label={t('initiative')} value={formatBonus(character.initiative.totalBonus)} />
          </Panel>
        </Stack>
      </Box>
    </Bento>
  );
};

const Equipment = ({ character }: { character: Character }) => {
  const { t } = useTranslation();
  const slots = Object.entries(character.equipment.slots) as [EquipmentSlot, string | null][];
  return (
    <Bento>
      <Box sx={span(12, 8)}>
        <Panel title={t('equipment')}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 1 }}>
            {slots.map(([slot, itemId]) => (
              <Box
                key={slot}
                sx={(theme) => ({
                  p: 1.5,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: `${theme.radius.sm}px`,
                  borderStyle: itemId ? 'solid' : 'dashed',
                })}
              >
                <Typography variant="caption" color="text.secondary">
                  {t(slot)}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }} color={itemId ? 'text.primary' : 'text.disabled'}>
                  {itemId ? t(itemNames[itemId] ?? itemId) : '—'}
                </Typography>
              </Box>
            ))}
          </Box>
        </Panel>
      </Box>
      <Box sx={span(12, 4)}>
        <Panel title={t('encumbrance')}>
          <LoadPanel character={character} />
        </Panel>
      </Box>
    </Bento>
  );
};

const Progression = ({ character }: { character: Character }) => {
  const { t } = useTranslation();
  const { experience, hp } = character;
  return (
    <Bento>
      <Box sx={span(6, 4)}>
        <Panel title={t('experience')}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <StatPill label={t('level')} value={experience.level} />
            <StatPill label={t('dev-points')} value={experience.availableDevPoints} />
          </Stack>
          <ResourceBar
            label={t('xp')}
            current={experience.xp}
            max={40000}
            kind="xp"
            valueLabel={experience.xp.toLocaleString()}
          />
        </Panel>
      </Box>
      <Box sx={span(6, 8)}>
        <Panel title={t('healing')}>
          <ResourceBar label={t('hit-points')} current={hp.current} max={hp.max} kind="hp" />
        </Panel>
      </Box>
    </Bento>
  );
};

const CharacterSheet = ({ character }: { character: Character }) => {
  const { t } = useTranslation();
  const [section, setSection] = useSectionParam([...sectionIds]);
  const entity: EntityState<Character> = {
    entity: character,
    setEntity: () => undefined,
    loading: false,
    error: null,
    notFound: false,
    refresh: () => undefined,
  };
  const content: Record<SectionId, ReactNode> = {
    overview: <Overview character={character} go={setSection} />,
    attributes: <Attributes character={character} />,
    skills: <Skills character={character} />,
    combat: <Combat character={character} />,
    equipment: <Equipment character={character} />,
    progression: <Progression character={character} />,
  };
  return (
    <DetailPage
      breadcrumbs={[{ name: t('characters'), link: '/strategic/characters' }, { name: character.name }]}
      entity={entity}
      onEdit={() => undefined}
      onDelete={() => undefined}
      technicalInfo={false}
      hero={(c) => ({
        title: c.name,
        overline: `${t('level')} ${c.experience.level} · ${t(c.info.professionId)}`,
        image: c.imageUrl,
        chips: [
          <Chip key="race" label={c.info.race.name} />,
          ...(c.info.realmTypes ?? [c.info.realmType]).map((realm) => (
            <Chip key={`realm-${realm}`} label={t(realm)} variant="outlined" />
          )),
          <Chip key="faction" label={c.faction.name} variant="outlined" />,
        ],
        resources: [
          <ResourceBar key="hp" label={t('hit-points')} current={c.hp.current} max={c.hp.max} kind="hp" dense />,
          ...(c.power
            ? [<ResourceBar key="pp" label={t('power')} current={c.power.current} max={c.power.max} kind="pp" dense />]
            : []),
          <ResourceBar
            key="xp"
            label={t('experience')}
            current={c.experience.xp}
            max={40000}
            kind="xp"
            valueLabel={c.experience.xp.toLocaleString()}
            dense
          />,
        ],
        pills: [
          <StatPill key="db" label={t('bd')} hint={t('db')} value={c.defense.defensiveBonus} signed />,
          <StatPill key="at" label={t('at-short')} hint={t('at')} value={c.defense.armor.at ?? '-'} />,
          <StatPill
            key="ini"
            label={t('initiative-short')}
            hint={t('initiative')}
            value={c.initiative.totalBonus}
            signed
          />,
          <StatPill key="bmr" label={t('bmr')} value={c.movement.baseMovementRate} />,
          <StatPill
            key="mp"
            label={t('maneuver-penalty-short')}
            hint={t('maneuver-penalty')}
            value={c.equipment.maneuverPenalty}
            signed
          />,
        ],
      })}
    >
      {() => (
        <Stack spacing={2}>
          <SectionNav
            label={t('character-sections')}
            value={section}
            onChange={setSection}
            sections={sectionIds.map((id) => ({ id, label: t(id) }))}
          />
          <Box key={section} sx={enterSx()}>
            {content[section as SectionId]}
          </Box>
        </Stack>
      )}
    </DetailPage>
  );
};

const meta = {
  title: 'Prototypes/Character sheet',
  component: CharacterSheet,
  args: { character: sampleCharacter },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CharacterSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview_: Story = { name: 'Overview' };

export const WithoutPower: Story = { args: { character: { ...sampleCharacter, power: null } } };
