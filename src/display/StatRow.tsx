import React from 'react';
import { KeyValueLine, KeyValueTone } from './KeyValuePanel';

/** A single label / value row, the same as a row of KeyValueList (spec 066, decision 5). */
export default function StatRow({
  label,
  value,
  danger,
  success,
  penalty,
  hint,
}: {
  label: string;
  value: string | number;
  danger?: boolean;
  success?: boolean;
  /** Red when negative, dimmed when zero. */
  penalty?: boolean;
  hint?: string;
}) {
  const tone: KeyValueTone = danger ? 'danger' : success ? 'success' : penalty ? 'penalty' : 'default';
  return (
    <dl style={{ margin: 0 }}>
      <KeyValueLine label={label} value={value} tone={tone} hint={hint} />
    </dl>
  );
}
