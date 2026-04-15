import React, { FC, useState } from 'react';
import { Stack } from '@mui/material';

export type OpenEndedRollProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  name: string;
};

const OpenEndedRollInput: FC<OpenEndedRollProps> = ({ value, onChange, label, name }) => {
  const [rolls, setRolls] = useState<number[]>();

  return <Stack></Stack>;
};

export default OpenEndedRollInput;
