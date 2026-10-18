import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { fetchAttackTables, fetchFumbleTables } from '../api/attack-table.api';
import { useNotify } from '../app/NotificationProvider';
import EntitySelect from '../ui/EntitySelect';

type TableSelectProps = {
  value: string | null | undefined;
  onChange: (table: string | null) => void;
  label?: string;
  name?: string;
  required?: boolean;
};

const useTables = (fetcher: typeof fetchAttackTables) => {
  const auth = useAuth();
  const notify = useNotify();
  const [tables, setTables] = useState<string[]>();
  useEffect(() => {
    fetcher(auth).then(setTables).catch(notify.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return tables;
};

const TableSelect: FC<TableSelectProps & { tables: string[] | undefined; defaultLabel: string }> = ({
  tables,
  value,
  onChange,
  label,
  name,
  required = true,
  defaultLabel,
}) => {
  const { t } = useTranslation();
  return (
    <EntitySelect<string>
      options={tables ?? []}
      value={value}
      onChange={(table) => onChange(table)}
      getId={(table) => table}
      getLabel={(table) => t(table)}
      label={t(label ?? defaultLabel)}
      name={name ?? defaultLabel}
      required={required}
      loading={!tables}
    />
  );
};

/** Attack table select (items, NPC attacks). Requires a NotificationProvider (MfeRoot). */
export const SelectAttackTable: FC<TableSelectProps> = (props) => {
  const tables = useTables(fetchAttackTables);
  return <TableSelect {...props} tables={tables} defaultLabel="attack-table" />;
};

/** Fumble table select (items, NPC attacks). Requires a NotificationProvider (MfeRoot). */
export const SelectFumbleTable: FC<TableSelectProps> = (props) => {
  const tables = useTables(fetchFumbleTables);
  return <TableSelect {...props} tables={tables} defaultLabel="fumble-table" />;
};
