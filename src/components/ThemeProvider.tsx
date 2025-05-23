'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { PaletteMode } from '@mui/material';

// Define the business theme colors
const BUSINESS_GOLD = '#ffc451';
const BUSINESS_BLACK = '#000000';
const BUSINESS_WHITE = '#ffffff';

// Create theme context
type ThemeContextType = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme Provider Component
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Check if there's a saved theme preference
  const [mode, setMode] = useState<PaletteMode>('light');

  useEffect(() => {
    // Check for saved theme preference
    const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;
    if (savedMode) {
      setMode(savedMode);
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Toggle theme function
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // Create theme based on mode
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: BUSINESS_GOLD,
            contrastText: BUSINESS_BLACK,
          },
          secondary: {
            main: mode === 'light' ? BUSINESS_BLACK : BUSINESS_WHITE,
            contrastText: mode === 'light' ? BUSINESS_WHITE : BUSINESS_BLACK,
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? BUSINESS_WHITE : '#1e1e1e',
          },
          text: {
            primary: mode === 'light' ? '#333333' : '#f5f5f5',
            secondary: mode === 'light' ? '#666666' : '#aaaaaa',
          },
        },
        typography: {
          // Make all text a bit smaller as requested
          fontSize: 14,
          h1: { fontSize: '2.5rem' },
          h2: { fontSize: '2rem' },
          h3: { fontSize: '1.75rem' },
          h4: { fontSize: '1.5rem' },
          h5: { fontSize: '1.25rem' },
          h6: { fontSize: '1rem' },
          body1: { fontSize: '0.9rem' },
          body2: { fontSize: '0.8rem' },
          button: { textTransform: 'none' },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 4,
              },
              contained: {
                boxShadow: 'none',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                boxShadow: mode === 'light'
                  ? '0px 2px 6px rgba(0, 0, 0, 0.08)'
                  : '0px 2px 6px rgba(0, 0, 0, 0.25)',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? BUSINESS_WHITE : BUSINESS_BLACK,
                color: mode === 'light' ? BUSINESS_BLACK : BUSINESS_WHITE,
                boxShadow: mode === 'light'
                  ? '0px 2px 4px rgba(0, 0, 0, 0.05)'
                  : '0px 2px 4px rgba(0, 0, 0, 0.2)',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                fontSize: '0.875rem',
              },
              head: {
                fontWeight: 600,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontSize: '0.75rem',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
