/**
 * @file DataTable.tsx
 * @description A wrapper component for StyledTable that adds pagination and filtering capabilities
 */

import React from 'react';
import { TextInput, Group, Pagination, Stack, Table } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { StyledTable } from './StyledTable';

interface Column {
  key: string;
  label: string;
  filterable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column[];
  rowComponent: (item: T) => React.ReactNode;
  withPagination?: boolean;
  withFiltering?: boolean;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  filterInputProps?: {
    rightSection?: React.ReactNode;
    rightSectionWidth?: number;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
}

export function DataTable<T>({ 
  data, 
  columns, 
  rowComponent,
  withPagination = false,
  withFiltering = false,
  pageSize = 10,
  currentPage,
  onPageChange,
  filterInputProps
}: DataTableProps<T>) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');

  // Use external pagination state if provided, otherwise use internal
  const activePage = currentPage ?? internalCurrentPage;
  const handlePageChange = onPageChange ?? setInternalCurrentPage;

  // Use external search term if provided, otherwise use internal
  const searchTerm = filterInputProps?.value ?? internalSearchTerm;
  const handleSearchChange = filterInputProps?.onChange ?? ((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalSearchTerm(e.currentTarget.value);
    // Reset page to 1 when search changes
    if (onPageChange) {
      onPageChange(1);
    } else {
      setInternalCurrentPage(1);
    }
  });

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(item => {
      // Search through all filterable columns
      return columns
        .filter(col => col.filterable)
        .some(col => {
          const value = (item as any)[col.key];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return String(value).includes(searchTerm);
        });
    });
  }, [data, searchTerm, columns]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = withPagination
    ? filteredData.slice((activePage - 1) * pageSize, activePage * pageSize)
    : filteredData;

  return (
    <Stack gap="sm">
      {withFiltering && (
        <Group gap="sm" justify="space-between" align="center">
          <TextInput
            placeholder="Search..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ flex: 1 }}
          />
          {filterInputProps?.rightSection}
        </Group>
      )}

      <StyledTable>
        <Table.Thead>
          <Table.Tr>
            {columns.map(col => (
              <Table.Th key={col.key}>{col.label}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {paginatedData.map((item, index) => (
            <React.Fragment key={(item as any).id ?? index}>
              {rowComponent(item)}
            </React.Fragment>
          ))}
        </Table.Tbody>
      </StyledTable>

      {withPagination && totalPages > 1 && (
        <Group justify="center">
          <Pagination
            value={activePage}
            onChange={handlePageChange}
            total={totalPages}
          />
        </Group>
      )}
    </Stack>
  );
} 