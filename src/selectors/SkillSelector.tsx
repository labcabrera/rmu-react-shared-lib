/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, FC } from 'react';
import { useAuth } from 'react-oidc-context';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import { Grid, Stack, Button } from '@mui/material';
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
  //TODO fix i18n instance
  t: (message: string) => string;
}> = ({ realmId, onSkillChange, onSpecializationChange, onError, t }) => {
  const auth = useAuth();
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
        <CategorySeparator text={t('Skill category')} />
        <SelectionList
          value={selectedCategory}
          options={availableCategories}
          onChange={(value: any) => setSelectedCategory(value)}
          formatter={(value: any) => t(value.id as string)}
        />
      </Grid>
      {selectedCategory && (
        <Grid size={12}>
          <CategorySeparator text={t('Skill')} />
          <SelectionList
            value={selectedSkill}
            options={availableSkills}
            onChange={(value: any) => setSelectedSkill(value as Skill)}
            formatter={(value: any) => {
              return (
                <>
                  {t(value.id)}
                  {value.specialization && <EditSquareIcon sx={{ ml: 1, fontSize: '0.8em' }} />}
                </>
              );
            }}
          />
        </Grid>
      )}
      {selectedSkill && availableSpecializations && (
        <Grid size={12}>
          <CategorySeparator text={t('Specialization')} />
          <SelectionList
            value={selectedSpecialization}
            options={availableSpecializations}
            onChange={(value) => setSelectedSpecialization(value)}
            formatter={(value: any) => t(value as string)}
          />
        </Grid>
      )}
    </Grid>
  );
};

const SelectionList: FC<{
  value: any;
  options: any[];
  onChange: (value: any) => void;
  formatter: (value: any) => any;
}> = ({ value, options, onChange, formatter }) => {
  return (
    <Stack
      direction={'row'}
      spacing={1}
      sx={{
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        justifyContent: 'flex-start',
        rowGap: 1,
      }}
    >
      {options.map((option, index) => (
        <Button
          key={index}
          value={option}
          variant={option === value ? 'contained' : 'outlined'}
          onClick={() => onChange(option)}
          sx={{ flex: 'none' }}
        >
          {formatter(option)}
        </Button>
      ))}
    </Stack>
  );
};

export default SkillSelector;
