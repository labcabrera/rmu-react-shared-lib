import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityType } from '../../api/common.dto';
import { useIsAdmin } from '../../auth/roles';
import { EnumPicker } from '../../selectors/pickers';
import { ENTITY_SOURCES } from './entity-source';

export interface EntitySourceFieldProps {
  /** Current source; empty shows `user`, the default of the APIs. */
  value: EntityType | null | undefined;
  onChange: (value: EntityType) => void;
  disabled?: boolean;
}

/**
 * «Source» select of a form (spec 063, decision 8): Rulebook or User. Rendered only for admins, the only ones the APIs
 * let set it. A form sends `entitySource` only after this field changed it.
 */
const EntitySourceField: FC<EntitySourceFieldProps> = ({ value, onChange, disabled }) => {
  const { t } = useTranslation();
  const admin = useIsAdmin();
  if (!admin) return null;
  return (
    <EnumPicker
      name="entitySource"
      label={t('entity-source')}
      values={ENTITY_SOURCES}
      labelPrefix="entity-source-"
      variant="select"
      value={value ?? 'user'}
      disabled={disabled}
      onChange={(id) => id && onChange(id as EntityType)}
    />
  );
};

export default EntitySourceField;
