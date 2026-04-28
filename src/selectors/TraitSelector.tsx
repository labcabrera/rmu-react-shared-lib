/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, FC } from 'react';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import { Grid, Typography, Stack, Button, Select, MenuItem } from '@mui/material';
import { fetchEnumerations } from '../api/enumerations.api';
import { fetchTraits } from '../api/trait.api';
import { Trait, traitCategories } from '../api/trait.dto';
import CategorySeparator from '../display/CategorySeparator';

const SkillSelector: FC<{
  realmId?: string;
  onTraitChange: (trait: Trait | null) => void;
  onTierChange: (tier: number | null) => void;
  onSpecializationChange: (specialization: string | null) => void;
  onError: (message: string) => void;
  t: (message: string) => string;
}> = ({ realmId, onTraitChange, onTierChange, onSpecializationChange, onError, t }) => {
  const availableCategories = traitCategories;
  const [availableTraits, setAvailableTraits] = useState<Trait[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>();

  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedTrait, setSelectedTrait] = useState<Trait>();
  const [selectedTier, setSelectedTier] = useState<number>();
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>();

  const bindTraits = (category: string) => {
    fetchTraits(`category==${category}`, 0, 100)
      .then((data) => setAvailableTraits(data.content))
      .catch((error) => onError(error.message));
  };

  useEffect(() => {
    onTierChange(selectedTier || null);
  }, [selectedTier]);

  useEffect(() => {
    onSpecializationChange(selectedSpecialization || null);
  }, [selectedSpecialization]);

  useEffect(() => {
    onTraitChange(selectedTrait || null);
    setSelectedSpecialization(undefined);
    if (selectedTrait) {
      if (!selectedTrait.specialization) {
        setAvailableSpecializations(undefined);
      } else {
        const realmQuery = realmId ? `;(realmId==${realmId},realmId==null)` : ``;
        fetchEnumerations(`category==${selectedTrait.specialization}${realmQuery}`, 0, 100)
          .then((response) => setAvailableSpecializations(response.content.map((e) => e.key)))
          .catch((err) => onError(err.message));
      }
    }
  }, [selectedTrait]);

  useEffect(() => {
    setAvailableSpecializations(undefined);
    setSelectedTrait(undefined);
    setSelectedSpecialization(undefined);
    if (selectedCategory) {
      bindTraits(selectedCategory);
    }
  }, [selectedCategory]);

  if (!availableCategories) return <p>Loading...</p>;

  return (
    <Grid container spacing={1} sx={{ mt: 1 }}>
      <Grid size={12}>
        <CategorySeparator text={t('Category')} />
        <SelectionList
          value={selectedCategory}
          options={availableCategories}
          onChange={(value: any) => setSelectedCategory(value)}
          formatter={(value: any) => t(value)}
        />
      </Grid>
      {selectedCategory && (
        <Grid size={12}>
          <CategorySeparator text={t('Trait')} />
          <SelectionList
            value={selectedTrait}
            options={availableTraits}
            onChange={(value: any) => setSelectedTrait(value as Trait)}
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
      {selectedTrait && (
        <Grid size={12}>
          <Typography sx={{ mt: 3 }} color="secondary">
            {selectedTrait.description}
          </Typography>
        </Grid>
      )}
      {selectedTrait && availableSpecializations && (
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
      {selectedTrait && selectedTrait.isTierBased === true && (
        <Grid size={12}>
          <CategorySeparator text={t('Tier')} />
          <Grid container spacing={1}>
            <Grid size={4}>
              <Select
                label="Tier"
                value={selectedTier ?? ''}
                onChange={(e) => setSelectedTier(Number(e.target.value))}
                // displayEmpty
                fullWidth
              >
                {Array.from({ length: selectedTrait.maxTier! }, (_, i) => i + 1).map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
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
