import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../data/useDebounce';
import ClearableTextField from '../inputs/ClearableTextField';

/** Text filter that reports its value once the user stops typing (300 ms), not on every key. */
const SearchField: FC<{
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  name?: string;
  delay?: number;
}> = ({ value = '', onChange, label, name = 'search', delay = 300 }) => {
  const { t } = useTranslation();
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, delay);

  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <ClearableTextField
      label={label ?? t('name')}
      name={name}
      placeholder={label ?? t('name')}
      value={text}
      onChange={(next) => setText(next ?? '')}
    />
  );
};

export default SearchField;
