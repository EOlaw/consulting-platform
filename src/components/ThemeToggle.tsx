'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { styled } from '@mui/material/styles';

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'rotate(30deg)',
  },
}));

export default function ThemeToggle() {
  const { mode, toggleColorMode } = useTheme();
  const theme = useMuiTheme();

  return (
    <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      <AnimatedIconButton
        onClick={toggleColorMode}
        color="inherit"
        aria-label="toggle dark/light theme"
      >
        {mode === 'dark' ? (
          <Brightness7Icon sx={{ color: theme.palette.primary.main }} />
        ) : (
          <Brightness4Icon />
        )}
      </AnimatedIconButton>
    </Tooltip>
  );
}
