import { Stack, Typography } from '@mui/material';

export default function StatRow({
  label,
  value,
  danger,
  success,
}: {
  label: string;
  value: string | number;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <Stack direction="row" sx={{ py: 0.5, justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: success ? 'success.main' : danger ? 'error.main' : 'text.primary',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
