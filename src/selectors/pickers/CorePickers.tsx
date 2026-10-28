import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { REALM_TYPES } from '../../api/constants';
import { Culture } from '../../api/culture.dto';
import { fetchProfessions } from '../../api/profession.api';
import { Profession, RealmType } from '../../api/profession.dto';
import { Race } from '../../api/race.dto';
import { Realm } from '../../api/realm.dto';
import { SkillCategory } from '../../api/skill-category.dto';
import { Skill } from '../../api/skill.dto';
import { EntityOption } from '../EntityPicker';
import { PickerProps, PresetPicker, useFetched } from './preset';

/** Realm (world) of the catalog. */
export const RealmPicker: FC<PickerProps<Realm> & { realms: Realm[] | undefined }> = ({ realms, ...props }) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      kind="realm"
      label={t('realm')}
      options={realms?.map((realm) => ({
        id: realm.id,
        label: t(realm.name),
        imageUrl: realm.imageUrl,
        entity: realm,
      }))}
    />
  );
};

/** Race, with its image. */
export const RacePicker: FC<PickerProps<Race> & { races: Race[] | undefined }> = ({ races, ...props }) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      kind="race"
      label={t('race')}
      options={races?.map((race) => ({ id: race.id, label: t(race.name), imageUrl: race.imageUrl, entity: race }))}
    />
  );
};

/** Culture, with its image. */
export const CulturePicker: FC<PickerProps<Culture> & { cultures: Culture[] | undefined }> = ({
  cultures,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      kind="culture"
      label={t('culture')}
      options={cultures?.map((culture) => ({
        id: culture.id,
        label: t(culture.name),
        imageUrl: culture.imageUrl,
        entity: culture,
      }))}
    />
  );
};

const professionOption = (profession: Profession | string, t: (key: string) => string): EntityOption<Profession> => {
  const id = typeof profession === 'string' ? profession : profession.id;
  return {
    id,
    label: t(id),
    imageUrl: (typeof profession !== 'string' && profession.imageUrl) || `images/professions/${id}.png`,
    entity: typeof profession === 'string' ? undefined : profession,
  };
};

type ProfessionPickerProps = PickerProps<Profession> & {
  /** Professions or their ids; without them the picker loads every profession (needs an auth provider). */
  professions?: Profession[] | string[];
};

const ProfessionPickerOf: FC<ProfessionPickerProps> = ({ professions, ...props }) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      kind="profession"
      label={t('profession')}
      options={professions?.map((profession) => professionOption(profession, t))}
    />
  );
};

const FetchedProfessionPicker: FC<PickerProps<Profession>> = (props) => {
  const professions = useFetched((auth) => fetchProfessions('', 0, 100, auth).then((page) => page.content));
  return <ProfessionPickerOf {...props} professions={professions} />;
};

/** Profession, with its image (`images/professions/<id>.png`). Loads the professions when they are not passed. */
export const ProfessionPicker: FC<ProfessionPickerProps> = (props) =>
  props.professions ? <ProfessionPickerOf {...props} /> : <FetchedProfessionPicker {...props} />;

/** Skill, grouped by category (decision 9). Takes the skills, or only their ids (then without groups). */
export const SkillPicker: FC<PickerProps<Skill> & { skills: Skill[] | string[] | undefined }> = ({
  skills,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      kind="skill"
      label={t('skill')}
      options={skills?.map((skill) =>
        typeof skill === 'string'
          ? { id: skill, label: t(skill) }
          : { id: skill.id, label: t(skill.id), group: t(skill.categoryId), entity: skill }
      )}
    />
  );
};

/** Skill category. */
export const SkillCategoryPicker: FC<PickerProps<SkillCategory> & { categories: SkillCategory[] | undefined }> = ({
  categories,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      kind="skill-category"
      label={t('skill-category')}
      options={categories?.map((category) => ({ id: category.id, label: t(category.id), entity: category }))}
    />
  );
};

/** Realm of power (channeling, essence, mentalism), or the given subset (the available realms of a profession). */
export const RealmTypePicker: FC<PickerProps<RealmType> & { realmTypes?: readonly RealmType[] }> = ({
  realmTypes = REALM_TYPES,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <PresetPicker
      props={props}
      kind="realm"
      label={t('realm')}
      options={realmTypes.map((realmType) => ({ id: realmType, label: t(realmType), entity: realmType }))}
    />
  );
};
