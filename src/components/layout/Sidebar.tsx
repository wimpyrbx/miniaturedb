import { Box } from '@mantine/core';

import React from 'react';
export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <Box
      style={{
        minWidth: '250px',
        padding: 'var(--mantine-spacing-md)',
        borderRight: '1px solid var(--mantine-color-gray-2)',
      }}
    >
      {children}
    </Box>
  );
} 