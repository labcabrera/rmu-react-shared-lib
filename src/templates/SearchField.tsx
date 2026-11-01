import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { useDebounce } from '../data/useDebounce';
import ClearableTextField from '../inputs/ClearableTextField';

/**
 * Search box of every list, picker and dialog (spec 066, decision 11): search icon, clear button, and the value
 * reported once the user stops typing (`delay` ms, 300 by default; 0 reports every key). A change of `value` from
 * outside (a filter chip cleared) replaces the text.
 */
const SearchField: FC<{
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  name?: string;
  delay?: number;
  size?: 'small' | 'medium';
  autoFocus?: boolean;
}> = ({ value = '', onChange, label, placeholder, name = 'search', delay = 300, size, autoFocus }) => {
  const { t } = useTranslation();
  const [text, setText] = useState(value);
  const reported = useRef(value);
  const debounced = useDebounce(text, delay);

  useEffect(() => {
    if (value !== reported.current) {
      reported.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    if (delay > 0 && debounced !== reported.current) {
      reported.current = debounced;
      onChange(debounced);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const change = (next: string) => {
    setText(next);
    if (delay === 0) {
      reported.current = next;
      onChange(next);
    }
  };

  return (
    <ClearableTextField
      label={label ?? t('search')}
      name={name}
      placeholder={placeholder ?? label ?? t('search')}
      value={text}
      size={size}
      autoFocus={autoFocus}
      startIcon={<SearchIcon fontSize="small" />}
      onChange={(next) => change(next ?? '')}
    />
  );
};

export default SearchField;
