import React, { FC, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete, TextField } from '@mui/material';
import { Realm } from '../api/realm.dto';

const SelectRealm: FC<{
  realms: Realm[];
  value: string | null;
  onChange: (realmId: string | null, realm: Realm | null) => void;
  required?: boolean;
}> = ({ realms, value, onChange, required = false }) => {
  const { t } = useTranslation();
  const handleChange = (realmId: string) => {
    const selectedRealm = realms.find((realm) => realm.id === realmId);
    onChange(realmId, selectedRealm || null);
  };

  if (!realms) return <p>Loading...</p>;

  return (
    <Autocomplete
      disablePortal
      options={realms}
      getOptionLabel={(option) => option.name}
      onChange={(_, newValue) => handleChange(newValue?.id || '')}
      fullWidth
      renderInput={(params) => <TextField {...params} label={t('realm')} fullWidth error={required && !value} />}
    />
  );
};

export default SelectRealm;
