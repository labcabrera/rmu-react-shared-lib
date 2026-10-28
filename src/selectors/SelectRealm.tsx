import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Realm } from '../api/realm.dto';
import EntitySelect from '../ui/EntitySelect';

/**
 * Searchable realm select (an EntitySelect preset). It can be cleared, which reports null.
 *
 * @deprecated Use RealmPicker (spec 046); removed in the next major.
 */
const SelectRealm: FC<{
  realms: Realm[];
  value: string | null | undefined;
  onChange: (realmId: string | null, realm: Realm | null) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}> = ({ realms, value, onChange, label, required = false, disabled = false, name = 'realm' }) => {
  const { t } = useTranslation();
  return (
    <EntitySelect
      options={realms ?? []}
      value={value}
      onChange={onChange}
      label={label ?? t('realm')}
      getLabel={(realm) => t(realm.name)}
      required={required}
      disabled={disabled}
      loading={!realms}
      name={name}
    />
  );
};

export default SelectRealm;
