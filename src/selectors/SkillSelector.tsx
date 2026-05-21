import React, { useState, useEffect, FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import { Chip, Grid, Paper, Stack } from '@mui/material';
import { fetchEnumerations } from '../api/enumerations.api';
import { fetchSkillCategories } from '../api/skill-category.api';
import { SkillCategory } from '../api/skill-category.dto';
import { fetchSkills } from '../api/skill.api';
import { Skill } from '../api/skill.dto';
import CategorySeparator from '../display/CategorySeparator';

const SkillSelector: FC<{
  realmId?: string;
  onSkillChange: (skillId: string | null) => void;
  onSpecializationChange: (specialization: string | null) => void;
  onError: (message: string) => void;
}> = ({ realmId, onSkillChange, onSpecializationChange, onError }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [availableCategories, setAvailableCategories] = useState<SkillCategory[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>();

  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);

  const bindSkillCategories = () => {
    fetchSkillCategories('', 0, 100, auth)
      .then((data) => setAvailableCategories(data.content))
      .catch((error) => onError(error.message));
  };

  const bindSkills = (categoryId: string) => {
    fetchSkills(`categoryId==${categoryId}`, 0, 100, auth)
      .then((data) => setAvailableSkills(data.content))
      .catch((error) => onError(error.message));
  };

  useEffect(() => {
    onSpecializationChange(selectedSpecialization);
  }, [selectedSpecialization]);

  useEffect(() => {
    onSkillChange(selectedSkill ? selectedSkill.id : null);
    setSelectedSpecialization(null);
    if (selectedSkill) {
      if (!selectedSkill.specialization) {
        setAvailableSpecializations(undefined);
      } else {
        const realmQuery = realmId ? `;(realmId==${realmId},realmId==null)` : ``;
        fetchEnumerations(`category==${selectedSkill.specialization}${realmQuery}`, 0, 100, auth)
          .then((response) => setAvailableSpecializations(response.content.map((e) => e.key)))
          .catch((err) => onError(err.message));
      }
    }
  }, [selectedSkill, auth]);

  useEffect(() => {
    setAvailableSpecializations(undefined);
    setSelectedSkill(null);
    setSelectedSpecialization(null);
    if (selectedCategory) {
      bindSkills(selectedCategory.id);
    }
  }, [selectedCategory]);

  useEffect(() => {
    bindSkillCategories();
  }, [realmId]);

  if (!availableCategories) return <p>Loading...</p>;

  return (
    <Grid container spacing={1} sx={{ mt: 1 }}>
      <Grid size={12}>
        <CategorySeparator text={t('skill-category')} />
        <SelectionList
          value={selectedCategory}
          options={availableCategories}
          onChange={setSelectedCategory}
          getKey={(value) => value.id}
          formatter={(value) => t(value.id)}
        />
      </Grid>
      {selectedCategory && (
        <Grid size={12}>
          <CategorySeparator text={t('skill')} />
          <SelectionList
            value={selectedSkill}
            options={availableSkills}
            onChange={setSelectedSkill}
            getKey={(value) => value.id}
            formatter={(value) => {
              return (
                <>
                  {t(value.id)}
                  {value.specialization && <EditSquareIcon sx={{ ml: 0.5 }} />}
                </>
              );
            }}
          />
        </Grid>
      )}
      {selectedSkill && availableSpecializations && (
        <Grid size={12}>
          <CategorySeparator text={t('specialization')} />
          <SelectionList
            value={selectedSpecialization}
            options={availableSpecializations}
            onChange={(value) => setSelectedSpecialization(value)}
            getKey={(value) => value}
            formatter={(value) => t(value)}
          />
        </Grid>
      )}
    </Grid>
  );
};

type SelectionListProps<T> = {
  value: T | null | undefined;
  options: T[];
  onChange: (value: T) => void;
  getKey: (value: T) => string;
  formatter: (value: T) => ReactNode;
};

const SelectionList = <T,>({ value, options, onChange, getKey, formatter }: SelectionListProps<T>) => {
  return (
    <Stack
      direction={'row'}
      sx={{
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        justifyContent: 'flex-start',
        gap: 1,
      }}
    >
      {options.map((option) => {
        const selected = option === value;

        return (
          <Chip
            key={getKey(option)}
            label={
              <Stack direction="row" sx={{ alignItems: 'center' }}>
                {formatter(option)}
              </Stack>
            }
            clickable
            color={selected ? 'primary' : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            onClick={() => onChange(option)}
            sx={{
              flex: 'none',
              textTransform: 'uppercase',
              '& .MuiChip-label': {
                px: 1.5,
              },
            }}
          />
        );
      })}
    </Stack>
  );
};

export default SkillSelector;
