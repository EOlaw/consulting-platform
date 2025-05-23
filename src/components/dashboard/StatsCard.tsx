import * as React from 'react';
import { Box, Paper, Typography, SvgIconProps } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<SvgIconProps>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function StatsCard({ title, value, icon, trend, color = 'primary.main' }: StatsCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        height: 120,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -15,
          right: -15,
          backgroundColor: `${color}20`,
          borderRadius: '50%',
          width: 80,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {React.cloneElement(icon, {
          sx: { fontSize: 30, color: color },
        })}
      </Box>

      <Typography component="p" variant="subtitle2" color="text.secondary">
        {title}
      </Typography>

      <Typography component="h2" variant="h4">
        {value}
      </Typography>

      {trend && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 1
          }}
        >
          <Typography
            component="p"
            variant="body2"
            sx={{
              color: trend.isPositive ? 'success.main' : 'error.main',
            }}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </Typography>
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            from last period
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
