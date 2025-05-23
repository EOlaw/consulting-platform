'use client';

import * as React from 'react';
import ThemeProvider from './ThemeProvider';

export function MuiSetup({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
