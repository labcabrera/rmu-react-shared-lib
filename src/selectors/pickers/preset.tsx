import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import type { AuthContextProps } from 'react-oidc-context';
import { useNotify } from '../../app/NotificationProvider';
import { EntityKind } from '../../config/default-images';
import EntityPicker, { EntityOption, EntityPickerProps, EntityPickerVariant } from '../EntityPicker';

/** Props every picker preset takes (spec 046, decision 9); the label has a default per preset. */
export type PickerBaseProps = {
  label?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: ReactNode;
  placeholder?: string;
  emptyText?: string;
  /** `auto` by default: tiles up to 8 options, a select above. */
  variant?: EntityPickerVariant;
};

export type PickerSingleProps<T> = PickerBaseProps & {
  mode?: 'single';
  value: string | null | undefined;
  onChange: (id: string | null, entity: T | undefined) => void;
  /** An "all" option first, which reports null (filters). */
  allowAll?: boolean;
  allLabel?: string;
  clearable?: boolean;
};

export type PickerMultipleProps<T> = PickerBaseProps & {
  mode: 'multiple';
  value: string[];
  onChange: (ids: string[], entities: T[]) => void;
  max?: number;
};

export type PickerProps<T> = PickerSingleProps<T> | PickerMultipleProps<T>;

/** An EntityPicker with the options, the kind and the default label of a preset. */
export const PresetPicker = <T,>({
  props,
  options,
  kind,
  label,
  hideImages,
  imageFilter,
}: {
  props: PickerProps<T>;
  options: EntityOption<T>[] | undefined;
  kind?: EntityKind;
  label: string;
  hideImages?: boolean;
  imageFilter?: string;
}) => (
  <EntityPicker<T>
    {...(props as EntityPickerProps<T>)}
    options={options}
    kind={kind}
    label={props.label ?? label}
    hideImages={hideImages}
    imageFilter={imageFilter}
  />
);

/** Loads the options of a preset once, when the caller does not pass them. Requires an auth and notification provider. */
export const useFetched = <T,>(fetcher: (auth: AuthContextProps) => Promise<T[]>): T[] | undefined => {
  const auth = useAuth();
  const notify = useNotify();
  const [values, setValues] = useState<T[]>();
  useEffect(() => {
    fetcher(auth).then(setValues).catch(notify.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return values;
};
