import { useState } from 'react';
import { Stack, Title, Text, Group, Card, Modal, Button, TextInput, MultiSelect, Select, Textarea, NumberInput, useMantineColorScheme, Radio, TagsInput, Badge } from '@mantine/core';
import { DataTable } from '../components/ui/table/DataTable';
import { Table } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TableActions } from '../components/ui/tableactions/TableActions';
import { IconEdit } from '@tabler/icons-react';

interface Category {
  id: number;
  name: string;
}

interface MiniType {
  id: number;
  name: string;
  categories: number[];
  category_names: string[];
  mini_ids: number[];
  mini_count: number;
}

interface Tag {
  id: number;
  name: string;
}

interface Mini {
  id: number;
  name: string;
  description: string | null;
  location: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  painted_by_id: number;
  base_size_id: number;
  product_set_id: number | null;
  types: Array<{
    id: number;
    name: string;
    proxy_type: boolean;
  }>;
  tags: Array<{
    id: number;
    name: string;
  }>;
  categories: number[];
  category_names: string[];
  base_size_name: string | null;
  painted_by_name: string | null;
  product_set_name: string | null;
  product_line_name: string | null;
  company_name: string | null;
}

interface BaseSize {
  id: number;
  base_size_name: string;
}

interface PaintedBy {
  id: number;
  painted_by_name: string;
}

interface ProductSet {
  id: number;
  name: string;
  product_line_id: number;
  product_line_name?: string;
  company_name?: string;
  mini_count?: number;
}

interface TableActionsProps {
  elementType: 'icon';
  onEdit: () => void;
  onDelete?: () => void;
}

export default function Products() {
  const queryClient = useQueryClient();
  const { colorScheme } = useMantineColorScheme();
  const [editingMini, setEditingMini] = useState<Mini | null>(null);

  // Custom row component
  const RowComponent = ({ children, ...props }: { children: React.ReactNode } & React.HTMLProps<HTMLTableRowElement>) => (
    <tr {...props}>{children}</tr>
  );

  // Queries with better caching
  const { data: minis, isLoading: isLoadingMinis } = useQuery<Mini[]>({
    queryKey: ['minis'],
    queryFn: async () => {
      const response = await fetch('/api/minis');
      if (!response.ok) throw new Error('Failed to fetch minis');
      return response.json();
    },
    staleTime: 30000 // Consider data fresh for 30 seconds
  });

  // Column definitions
  const columns = [
    { 
      key: 'name', 
      label: 'Name', 
      filterable: true,
      render: (mini: Mini) => (
        <Group>
          <Text>{mini.name}</Text>
          {mini.description && (
            <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
              {mini.description}
            </Text>
          )}
        </Group>
      )
    },
    { 
      key: 'type', 
      label: 'Type', 
      filterable: true,
      render: (mini: Mini) => (
        <Stack gap="xs">
          {mini.types.map((type) => (
            <Group gap="xs" key={type.id}>
              <Text>{type.name}</Text>
              {!type.proxy_type && (
                <Text size="xs" c="dimmed">(main)</Text>
              )}
            </Group>
          ))}
        </Stack>
      )
    },
    { 
      key: 'categories', 
      label: 'Categories', 
      filterable: true,
      render: (mini: Mini) => (
        <Text>{mini.category_names.join(', ') || '-'}</Text>
      )
    },
    { 
      key: 'tags', 
      label: 'Tags', 
      filterable: true,
      render: (mini: Mini) => (
        <Group gap="xs" wrap="wrap">
          {mini.tags?.length > 0 ? (
            mini.tags.map(tag => (
              <Badge 
                key={tag.id} 
                size="sm" 
                variant="light"
                color="blue"
              >
                {tag.name}
              </Badge>
            ))
          ) : (
            <Text c="dimmed">-</Text>
          )}
        </Group>
      )
    },
    { 
      key: 'location', 
      label: 'Location', 
      filterable: true,
      render: (mini: Mini) => (
        <Text>{mini.location}</Text>
      )
    },
    { 
      key: 'painted_by', 
      label: 'Painted By', 
      filterable: true,
      render: (mini: Mini) => (
        <Text>{mini.painted_by_name || '-'}</Text>
      )
    },
    { 
      key: 'base_size', 
      label: 'Base Size', 
      filterable: true,
      render: (mini: Mini) => (
        <Text>{mini.base_size_name || '-'}</Text>
      )
    },
    { 
      key: 'actions', 
      label: '',
      render: (mini: Mini) => (
        <TableActions
          elementType="icon"
          onEdit={() => setEditingMini(mini)}
          onDelete={() => {}}
        />
      )
    }
  ];

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Products</Title>
      </Group>

      <DataTable<Mini>
        columns={columns}
        data={minis || []}
        rowComponent={RowComponent}
      />

      {/* Edit Modal */}
      <Modal
        opened={!!editingMini}
        onClose={() => setEditingMini(null)}
        title="Edit Mini"
        size="xl"
      >
        {editingMini && (
          <Stack>
            {/* ... rest of the modal content ... */}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
} 