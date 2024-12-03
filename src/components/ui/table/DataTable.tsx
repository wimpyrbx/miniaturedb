/**
 * @file DataTable.tsx
 * @description A wrapper component for StyledTable that adds pagination and filtering capabilities
 */

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
  filterInputProps?: {
    rightSection?: React.ReactNode;
    rightSectionWidth?: number;
  };
}

export function DataTable<T>({ 
  data, 
  columns, 
  rowComponent,
  withPagination = false,
  withFiltering = false,
  pageSize = 10,
  filterInputProps
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

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
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  // Reset to first page when filter changes
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <Stack gap="sm">
      {withFiltering && (
        <Group gap="sm" justify="space-between" align="center">
          <TextInput
            placeholder="Search..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => handleSearch(e.currentTarget.value)}
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
          {paginatedData.map((item, index) => rowComponent(item))}
        </Table.Tbody>
      </StyledTable>

      {withPagination && totalPages > 1 && (
        <Group justify="center">
          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            total={totalPages}
          />
        </Group>
      )}
    </Stack>
  );
} 