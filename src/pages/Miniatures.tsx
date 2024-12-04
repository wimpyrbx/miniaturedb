import React from 'react';
import { useState } from 'react';
import { Stack, Title, Text, Group, Card, Modal, Button, TextInput, MultiSelect, Select, Textarea, NumberInput, useMantineColorScheme, Radio, TagsInput, Badge, Center, Loader } from '@mantine/core';
import { DataTable } from '../components/ui/table/DataTable';
import { Table } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TableActions } from '../components/ui/tableactions/TableActions';
import { IconEdit, IconPlus, IconPhoto } from '@tabler/icons-react';

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

const MAX_PILLS = 3;

const PillsList = ({ 
  items, 
  color, 
  getItemColor 
}: { 
  items: Array<{ id: number, name: string, proxy_type?: boolean }> | string[], 
  color: string,
  getItemColor?: (item: any) => string
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayItems = isExpanded ? items : items.slice(0, MAX_PILLS);
  const remaining = items.length - MAX_PILLS;
  const hasMore = remaining > 0;

  return (
    <Group gap="xs" wrap="wrap" align="center">
      {displayItems.map((item, index) => (
        <Badge
          key={typeof item === 'string' ? index : item.id}
          color={getItemColor ? getItemColor(item) : color}
          variant="light"
          size="sm"
        >
          {typeof item === 'string' ? item : item.name}
        </Badge>
      ))}
      {hasMore && !isExpanded && (
        <Text 
          size="sm" 
          c="dimmed" 
          style={{ cursor: 'pointer' }}
          onClick={() => setIsExpanded(true)}
        >
          +{remaining} more
        </Text>
      )}
      {isExpanded && hasMore && (
        <Text 
          size="sm" 
          c="dimmed" 
          style={{ cursor: 'pointer' }}
          onClick={() => setIsExpanded(false)}
        >
          Show less
        </Text>
      )}
    </Group>
  );
};

const ClassificationSection = ({ label, items, color, getItemColor }: { 
  label: string, 
  items: any[], 
  color: string,
  getItemColor?: (item: any) => string 
}) => {
  if (!items || items.length === 0) return null;
  return (
    <Group gap="xs" align="center">
      <Text size="xs" fw={500} c="dimmed" style={{ textTransform: 'uppercase' }}>
        {label}:
      </Text>
      <PillsList items={items} color={color} getItemColor={getItemColor} />
    </Group>
  );
};

export default function Miniatures() {
  const queryClient = useQueryClient();
  const { colorScheme } = useMantineColorScheme();
  const [editingMini, setEditingMini] = useState<Mini | null>(null);
  const [isAddingMini, setIsAddingMini] = useState(false);

  // Custom row component
  const RowComponent = (mini: Mini) => (
    <Table.Tr key={mini.id}>
      <Table.Td style={{ width: '50px', maxWidth: '50px', padding: 'var(--mantine-spacing-xs)' }}>
        <div style={{ 
          width: '100%', 
          aspectRatio: '1',
          backgroundColor: 'var(--mantine-color-dark-4)',
          borderRadius: 'var(--mantine-radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconPhoto 
            style={{ 
              color: 'var(--mantine-color-dark-2)',
              opacity: 0.5 
            }} 
            size={24} 
          />
        </div>
      </Table.Td>
      <Table.Td>
        <Stack gap={4}>
          <Text>{mini.name}</Text>
          <Group gap={4}>
            <Text size="xs" c="primary.6" style={{ fontStyle: 'italic', opacity: 0.8 }}>
              {[mini.company_name, mini.product_line_name, mini.product_set_name].filter(Boolean).join(' » ')}
            </Text>
          </Group>
        </Stack>
      </Table.Td>
      <Table.Td>
        {mini.description ? (
          <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
            {mini.description}
          </Text>
        ) : (
          <Text c="dimmed">-</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Stack gap="xs">
          <PillsList 
            items={mini.types} 
            color="blue"
            getItemColor={(type) => type.proxy_type ? 'blue' : 'teal'} 
          />
          <PillsList 
            items={mini.category_names} 
            color="violet" 
          />
        </Stack>
      </Table.Td>
      <Table.Td>
        <PillsList
          items={mini.tags || []}
          color="pink"
        />
      </Table.Td>
      <Table.Td style={{ width: '120px' }}>
        <Text>{mini.location}</Text>
      </Table.Td>
      <Table.Td style={{ width: '120px' }}>
        <Text>{mini.painted_by_name ? mini.painted_by_name.charAt(0).toUpperCase() + mini.painted_by_name.slice(1) : '-'}</Text>
      </Table.Td>
      <Table.Td style={{ width: '100px' }}>
        <Text>{mini.base_size_name ? mini.base_size_name.charAt(0).toUpperCase() + mini.base_size_name.slice(1) : '-'}</Text>
      </Table.Td>
      <Table.Td style={{ width: '70px', padding: 'var(--mantine-spacing-xs)' }}>
        <Group justify="flex-end" wrap="nowrap">
          <TableActions
            elementType="icon"
            onEdit={() => setEditingMini(mini)}
            onDelete={() => {}}
          />
        </Group>
      </Table.Td>
    </Table.Tr>
  );

  // Queries with better caching
  const { data: minis, isLoading: isLoadingMinis } = useQuery<Mini[]>({
    queryKey: ['minis'],
    queryFn: async () => {
      const response = await fetch('/api/minis', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch minis');
      return response.json();
    },
    staleTime: 30000 // Consider data fresh for 30 seconds
  });

  // Column definitions
  const columns = [
    {
      key: 'image',
      label: '',
      width: 50,
      render: () => (
        <div style={{ 
          width: '100%', 
          aspectRatio: '1',
          backgroundColor: 'var(--mantine-color-dark-4)',
          borderRadius: 'var(--mantine-radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconPhoto 
            style={{ 
              color: 'var(--mantine-color-dark-2)',
              opacity: 0.5 
            }} 
            size={24} 
          />
        </div>
      )
    },
    { 
      key: 'name', 
      label: 'Name', 
      filterable: true,
      render: (mini: Mini) => (
        <Stack gap={4}>
          <Text>{mini.name}</Text>
          <Group gap={4}>
            <Text size="xs" c="primary.6" style={{ fontStyle: 'italic', opacity: 0.8 }}>
              {[mini.company_name, mini.product_line_name, mini.product_set_name].filter(Boolean).join(' » ')}
            </Text>
          </Group>
        </Stack>
      )
    },
    {
      key: 'description',
      label: 'Description',
      filterable: true,
      render: (mini: Mini) => (
        mini.description ? (
          <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
            {mini.description}
          </Text>
        ) : (
          <Text c="dimmed">-</Text>
        )
      )
    },
    { 
      key: 'classifications', 
      label: 'Classifications', 
      filterable: true,
      render: (mini: Mini) => (
        <Stack gap="xs">
          <PillsList 
            items={mini.types} 
            color="blue"
            getItemColor={(type) => type.proxy_type ? 'blue' : 'teal'} 
          />
          <PillsList 
            items={mini.category_names} 
            color="violet" 
          />
        </Stack>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      filterable: true,
      render: (mini: Mini) => (
        <PillsList
          items={mini.tags || []}
          color="pink"
        />
      )
    },
    { 
      key: 'location', 
      label: 'Location', 
      width: 120,
      filterable: true,
      render: (mini: Mini) => (
        <Text>{mini.location}</Text>
      )
    },
    { 
      key: 'painted_by', 
      label: 'Painted By', 
      width: 120,
      filterable: true,
      render: (mini: Mini) => (
        <Text>{mini.painted_by_name ? mini.painted_by_name.charAt(0).toUpperCase() + mini.painted_by_name.slice(1) : '-'}</Text>
      )
    },
    { 
      key: 'base_size', 
      label: 'Base Size', 
      width: 100,
      filterable: true,
      render: (mini: Mini) => (
        <Text>{mini.base_size_name ? mini.base_size_name.charAt(0).toUpperCase() + mini.base_size_name.slice(1) : '-'}</Text>
      )
    },
    { 
      key: 'actions', 
      label: '',
      width: 70,
      render: (mini: Mini) => (
        <Group justify="flex-end" wrap="nowrap">
          <TableActions
            elementType="icon"
            onEdit={() => setEditingMini(mini)}
            onDelete={() => {}}
          />
        </Group>
      )
    }
  ];

  return (
    <Stack>
      <Card shadow="xl" p={0}
        style={{
          borderRadius: 'var(--mantine-radius-md)',
          border: '1px solid var(--mantine-color-primary-light)'
        }}
      >
        <Group justify="space-between" p="sm" style={{ 
          borderBottom: '1px solid var(--mantine-color-default-border)',
          background: 'var(--mantine-color-primary-light)',
          position: 'relative',
          minHeight: 'var(--mantine-spacing-xl)',
          alignItems: 'flex-start'
        }}>
          <div>
            <Title order={2} size="h3" mb={5}>Miniatures</Title>
            <Text size="sm" c="dimmed">Manage your miniature collection below.</Text>
          </div>
          <Button 
            size="xs"
            variant="light"
            color="green"
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsAddingMini(true)}
          >
            Add Miniature
          </Button>
        </Group>

        <Stack p="sm">
          {isLoadingMinis ? (
            <Center py="md">
              <Loader size="sm" />
            </Center>
          ) : minis?.length === 0 ? (
            <Text c="dimmed" ta="center">No miniatures found</Text>
          ) : (
            <DataTable
              data={minis || []}
              columns={columns}
              rowComponent={RowComponent}
              withPagination
              withFiltering
              pageSize={10}
            />
          )}
        </Stack>
      </Card>

      {/* Edit Modal */}
      <Modal
        opened={!!editingMini}
        onClose={() => setEditingMini(null)}
        title="Edit Miniature"
        size="xl"
      >
        {editingMini && (
          <Stack>
            {/* ... rest of the modal content ... */}
          </Stack>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal
        opened={isAddingMini}
        onClose={() => setIsAddingMini(false)}
        title="Add Miniature"
        size="xl"
      >
        <Stack>
          {/* Add form content here */}
        </Stack>
      </Modal>
    </Stack>
  );
} 