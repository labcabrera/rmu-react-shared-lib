import React, { ReactElement, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MenuItem, Tab, Tabs, TextField } from '@mui/material';
import { usePhone } from '../templates/responsive';

export interface SectionDef {
  id: string;
  label: string;
  icon?: ReactElement;
}

/**
 * Navigation between the sections of a page: tabs on desktop and tablet (scrollable), a select on
 * phones, where a long tab bar hides most sections.
 */
export const SectionNav = ({
  sections,
  value,
  onChange,
  label,
}: {
  sections: SectionDef[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible name of the navigation (and the select's label on phones). */
  label: string;
}) => {
  const isPhone = usePhone();
  if (isPhone) {
    return (
      <TextField select fullWidth size="small" label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {sections.map((section) => (
          <MenuItem key={section.id} value={section.id}>
            {section.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }
  return (
    <Tabs value={value} onChange={(_, id: string) => onChange(id)} aria-label={label}>
      {sections.map((section) => (
        <Tab key={section.id} value={section.id} label={section.label} icon={section.icon} iconPosition="start" />
      ))}
    </Tabs>
  );
};

/**
 * The current section, kept in the `section` query param so it survives reloads and can be linked.
 * Unknown values fall back to the first section.
 */
export const useSectionParam = (ids: string[], param = 'section'): [string, (id: string) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = searchParams.get(param);
  const value = current && ids.includes(current) ? current : ids[0];
  const setValue = useCallback(
    (id: string) =>
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params);
          if (id === ids[0]) next.delete(param);
          else next.set(param, id);
          return next;
        },
        { replace: true }
      ),
    [ids, param, setSearchParams]
  );
  return [value, setValue];
};

export default SectionNav;
