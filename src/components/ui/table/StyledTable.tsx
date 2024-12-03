/**
 * @file StyledTable.tsx
 * @description A styled table component with consistent theme-aware styling
 */

import { Table, TableProps } from '@mantine/core';
import { ReactNode } from 'react';

interface StyledTableProps extends Omit<TableProps, 'styles'> {
  children: ReactNode;
}

export function StyledTable({ children, ...props }: StyledTableProps) {
  return (
    <Table 
      highlightOnHover 
      withTableBorder 
      styles={{
        table: {
          borderRadius: 'var(--mantine-radius-md)',
          overflow: 'hidden',
        },
        thead: {
          tr: {
            th: {
              '&:first-of-type': {
                borderTopLeftRadius: 'var(--mantine-radius-md)',
              },
              '&:lastOfType': {
                borderTopRightRadius: 'var(--mantine-radius-md)',
              }
            }
          }
        },
        th: {
          backgroundColor: 'var(--mantine-color-default-hover)',
        },
        tr: {
          borderBottom: '1px solid var(--mantine-color-dark-5)',
          '&:lastOfType': {
            borderBottom: 'none',
            td: {
              '&:first-of-type': {
                borderBottomLeftRadius: 'var(--mantine-radius-md)',
              },
              '&:lastOfType': {
                borderBottomRightRadius: 'var(--mantine-radius-md)',
              }
            }
          }
        }
      }}
      {...props}
    >
      {children}
    </Table>
  );
} 