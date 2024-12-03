/**
 * @file ClassificationAdmin.tsx
 * @description Admin page for managing miniature types and their categories in a hierarchical view
 */

import { useState, useEffect } from 'react';
import { Grid, Title, Card, Button, Group, Text, Stack, Modal, TextInput, Notification, Center, Loader, Box, useMantineColorScheme, Table, Switch } from '@mantine/core';
import { IconPlus, IconCheck, IconX } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TableActions } from '../components/ui/tableactions/TableActions';
import { modals } from '@mantine/modals';
import { DataTable } from '../components/ui/table/DataTable';

// Types
interface MiniatureType {
  id: number;
  name: string;
}

interface MiniatureCategory {
  id: number;
  name: string;
  type_id: number;
}

// Form types
type TypeForm = { name: string };
type CategoryForm = { name: string; type_id: number };

const openDeleteConfirmModal = (
  itemType: string,
  itemName: string,
  onConfirm: () => void
) => {
  modals.openConfirmModal({
    title: `Delete ${itemType}`,
    centered: true,
    children: (
      <Text size="sm">
        Are you sure you want to delete {itemType.toLowerCase()} <strong>{itemName}</strong>? 
        This action cannot be undone.
      </Text>
    ),
    labels: { confirm: 'Delete', cancel: 'Cancel' },
    confirmProps: { color: 'red' },
    onConfirm
  });
};

export function ClassificationAdmin() {
  const queryClient = useQueryClient();
  const { colorScheme } = useMantineColorScheme();
  const [selectedType, setSelectedType] = useState<MiniatureType | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    color: string;
  }>({ show: false, title: '', message: '', color: 'blue' });

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Modal states
  const [editType, setEditType] = useState<MiniatureType | null>(null);
  const [editCategory, setEditCategory] = useState<MiniatureCategory | null>(null);
  const [isAddingType, setIsAddingType] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [formName, setFormName] = useState('');
  const [showOnlyWithTypeChildren, setShowOnlyWithTypeChildren] = useState(false);

  // Queries
  const { data: types, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['miniature_types'],
    queryFn: async () => {
      const [typesResponse, relationshipsResponse] = await Promise.all([
        fetch('/api/classification/types'),
        fetch('/api/classification/type-categories')
      ]);

      if (!typesResponse.ok) throw new Error('Failed to fetch types');
      if (!relationshipsResponse.ok) throw new Error('Failed to fetch type-category relationships');

      const types = await typesResponse.json();
      const relationships = await relationshipsResponse.json();

      // Group categories by type_id
      const categoriesByType = relationships.reduce((acc: { [key: number]: MiniatureCategory[] }, curr: MiniatureCategory) => {
        if (!acc[curr.type_id]) {
          acc[curr.type_id] = [];
        }
        acc[curr.type_id].push(curr);
        return acc;
      }, {});

      // Store categories in query cache for each type
      Object.entries(categoriesByType).forEach(([typeId, categories]) => {
        queryClient.setQueryData(
          ['miniature_categories', parseInt(typeId)],
          categories
        );
      });

      return types;
    }
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['miniature_categories', selectedType?.id],
    queryFn: async () => {
      if (!selectedType) return [];
      // Try to get from cache first
      const cached = queryClient.getQueryData<MiniatureCategory[]>(['miniature_categories', selectedType.id]);
      if (cached) return cached;

      // If not in cache, fetch from server
      const response = await fetch(`/api/classification/types/${selectedType.id}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    enabled: !!selectedType
  });

  // Mutations
  const typeMutation = useMutation({
    mutationFn: async (data: { id?: number; name: string }) => {
      const response = await fetch(
        data.id ? `/api/classification/types/${data.id}` : '/api/classification/types',
        {
          method: data.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name })
        }
      );
      if (!response.ok) throw new Error('Failed to save type');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['miniature_types'] });
      setEditType(null);
      setIsAddingType(false);
      setFormName('');
      setNotification({
        show: true,
        title: variables.id ? 'Type Updated' : 'Type Created',
        message: `Successfully ${variables.id ? 'updated' : 'created'} type "${variables.name}"`,
        color: 'green'
      });
    },
    onError: (error: any) => {
      setNotification({
        show: true,
        title: 'Error',
        message: error.message || 'Failed to save type',
        color: 'red'
      });
    }
  });

  const categoryMutation = useMutation({
    mutationFn: async (data: { id?: number; name: string; type_id: number }) => {
      const response = await fetch(
        data.id ? `/api/classification/categories/${data.id}` : '/api/classification/categories',
        {
          method: data.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, type_id: data.type_id })
        }
      );
      if (!response.ok) throw new Error('Failed to save category');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['type-categories'] });
      queryClient.invalidateQueries({ 
        queryKey: ['miniature_categories', variables.type_id] 
      });
      queryClient.invalidateQueries({ queryKey: ['miniature_types'] });
      
      setEditCategory(null);
      setIsAddingCategory(false);
      setFormName('');
      setNotification({
        show: true,
        title: variables.id ? 'Category Updated' : 'Category Created',
        message: `Successfully ${variables.id ? 'updated' : 'created'} category "${variables.name}"`,
        color: 'green'
      });
    },
    onError: (error: any) => {
      setNotification({
        show: true,
        title: 'Error',
        message: error.message || 'Failed to save category',
        color: 'red'
      });
    }
  });

  // Delete mutations
  const typeDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/classification/types/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete type');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miniature_types'] });
      setNotification({
        show: true,
        title: 'Type Deleted',
        message: 'Successfully deleted type',
        color: 'yellow'
      });
    },
    onError: (error: any) => {
      setNotification({
        show: true,
        title: 'Error',
        message: error.message || 'Failed to delete type',
        color: 'red'
      });
    }
  });

  const categoryDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/classification/categories/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete category');
    },
    onSuccess: () => {
      if (selectedType) {
        queryClient.invalidateQueries({ queryKey: ['type-categories'] });
        queryClient.invalidateQueries({ 
          queryKey: ['miniature_categories', selectedType.id] 
        });
        queryClient.invalidateQueries({ queryKey: ['miniature_types'] });
      }
      setNotification({
        show: true,
        title: 'Category Deleted',
        message: 'Successfully deleted category',
        color: 'yellow'
      });
    },
    onError: (error: any) => {
      setNotification({
        show: true,
        title: 'Error',
        message: error.message || 'Failed to delete category',
        color: 'red'
      });
    }
  });

  // Form handlers
  const handleTypeSubmit = () => {
    if (editType) {
      typeMutation.mutate({ id: editType.id, name: formName });
    } else {
      typeMutation.mutate({ name: formName });
    }
  };

  const handleCategorySubmit = () => {
    if (!selectedType) return;
    if (editCategory) {
      categoryMutation.mutate({ 
        id: editCategory.id, 
        name: formName, 
        type_id: selectedType.id 
      });
    } else {
      categoryMutation.mutate({ 
        name: formName, 
        type_id: selectedType.id 
      });
    }
  };

  // Check if type has categories
  const typeHasCategories = (typeId: number) => {
    const typeCategories = queryClient.getQueryData<MiniatureCategory[]>(
      ['miniature_categories', typeId]
    );
    return typeCategories && typeCategories.length > 0;
  };

  // Column definitions
  const typeColumns = [
    { key: 'name', label: 'Name', filterable: true },
    { key: 'actions', label: '' }
  ];

  const categoryColumns = [
    { key: 'name', label: 'Name', filterable: true },
    { key: 'actions', label: '' }
  ];

  const renderTypeRow = (type: MiniatureType) => {
    const categoryCount = queryClient.getQueryData<MiniatureCategory[]>(
      ['miniature_categories', type.id]
    )?.length || 0;
    
    return (
      <Table.Tr 
        key={type.id} 
        style={{ 
          cursor: 'pointer',
          backgroundColor: selectedType?.id === type.id ? 'var(--mantine-color-blue-light)' : undefined 
        }}
        onClick={() => setSelectedType(type)}
      >
        <Table.Td>
          {type.name}
          {categoryCount > 0 && (
            <Text span size="sm" c="dimmed" ml={5}>({categoryCount})</Text>
          )}
        </Table.Td>
        <Table.Td>
          <Group justify="flex-end">
            <TableActions
              elementType="icon"
              onEdit={() => {
                setEditType(type);
                setFormName(type.name);
              }}
              onDelete={() => {
                openDeleteConfirmModal(
                  'Type',
                  type.name,
                  () => typeDeleteMutation.mutate(type.id)
                );
              }}
              canDelete={!typeHasCategories(type.id)}
              deleteTooltip="Cannot delete type that has categories"
            />
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  };

  const renderCategoryRow = (category: MiniatureCategory) => (
    <Table.Tr key={category.id}>
      <Table.Td>{category.name}</Table.Td>
      <Table.Td>
        <Group justify="flex-end">
          <TableActions
            elementType="icon"
            onEdit={() => {
              setEditCategory(category);
              setFormName(category.name);
            }}
            onDelete={() => {
              openDeleteConfirmModal(
                'Category',
                category.name,
                () => categoryDeleteMutation.mutate(category.id)
              );
            }}
          />
        </Group>
      </Table.Td>
    </Table.Tr>
  );

  // Update filter function
  const filterTypesWithChildren = (types: MiniatureType[]) => {
    if (!showOnlyWithTypeChildren) return types;
    return types.filter(type => {
      const categoryCount = queryClient.getQueryData<MiniatureCategory[]>(
        ['miniature_categories', type.id]
      )?.length || 0;
      return categoryCount > 0;
    });
  };

  return (
    <>
      <Stack gap="md">
        <Box>
          <Grid gutter="xs">
            {/* Types Column */}
            <Grid.Col span={4}>
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
                    <Title order={2} size="h3" mb={5}>Miniature Types</Title>
                    <Stack gap={2}>
                      <Text size="sm" c="dimmed">First select a type below,</Text>
                      <Text size="sm" c="dimmed">then manage its categories in the table to the right.</Text>
                    </Stack>
                  </div>
                  <Button 
                    size="xs"
                    variant="light"
                    color="green"
                    leftSection={<IconPlus size={16} />}
                    onClick={() => {
                      setFormName('');
                      setIsAddingType(true);
                    }}
                    style={{
                      position: 'absolute',
                      right: 'var(--mantine-spacing-sm)',
                      top: 'var(--mantine-spacing-sm)'
                    }}
                  >
                    Add Type
                  </Button>
                </Group>
                
                <Stack p="sm">
                  {isLoadingTypes ? (
                    <Center py="md">
                      <Loader size="sm" />
                    </Center>
                  ) : types?.length === 0 ? (
                    <Text c="dimmed" ta="center">No types found</Text>
                  ) : (
                    <DataTable
                      data={filterTypesWithChildren(types ?? [])}
                      columns={typeColumns}
                      rowComponent={renderTypeRow}
                      withPagination
                      withFiltering
                      pageSize={15}
                      filterInputProps={{
                        rightSection: (
                          <Group gap="xs" wrap="nowrap">
                            <Text size="sm" c="dimmed">In Use Only</Text>
                            <Switch
                              checked={showOnlyWithTypeChildren}
                              onChange={(event) => setShowOnlyWithTypeChildren(event.currentTarget.checked)}
                              size="sm"
                            />
                          </Group>
                        )
                      }}
                    />
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Categories Column */}
            <Grid.Col span={4}>
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
                    <Title order={2} size="h3" mb={5}>Categories</Title>
                    {selectedType ? (
                      <Stack gap={2}>
                        <Text size="sm" c="dimmed">
                          Type: <Text span fw={700} c={colorScheme === 'light' ? 'dark.9' : 'white'}>{selectedType.name}</Text>
                        </Text>
                        <Text size="sm" c="dimmed">Select or manage categories below.</Text>
                      </Stack>
                    ) : (
                      <Stack gap={2}>
                        <Text size="sm" c="dimmed">Select a type first to be able to</Text>
                        <Text size="sm" c="dimmed">manage its categories.</Text>
                      </Stack>
                    )}
                  </div>
                  {selectedType && (
                    <Button 
                      size="xs"
                      variant="light"
                      color="green"
                      leftSection={<IconPlus size={16} />}
                      onClick={() => {
                        setFormName('');
                        setIsAddingCategory(true);
                      }}
                      style={{
                        position: 'absolute',
                        right: 'var(--mantine-spacing-sm)',
                        top: 'var(--mantine-spacing-sm)'
                      }}
                    >
                      Add Category
                    </Button>
                  )}
                </Group>
                
                <Stack p="sm">
                  {!selectedType ? (
                    <Text c="dimmed" ta="center">Select a type to view its categories</Text>
                  ) : isLoadingCategories ? (
                    <Center py="md">
                      <Loader size="sm" />
                    </Center>
                  ) : categories?.length === 0 ? (
                    <Text c="dimmed" ta="center">No categories found</Text>
                  ) : (
                    <DataTable
                      data={categories ?? []}
                      columns={categoryColumns}
                      rowComponent={renderCategoryRow}
                      withPagination
                      withFiltering
                      pageSize={15}
                    />
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Box>

        {/* Notification */}
        {notification.show && (
          <Notification
            title={notification.title}
            color={notification.color}
            onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            icon={
              notification.color === 'red' ? <IconX size={18} /> : 
              notification.color === 'yellow' ? <IconCheck size={18} /> :
              <IconCheck size={18} />
            }
            style={{
              position: 'fixed',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000
            }}
          >
            {notification.message}
          </Notification>
        )}
      </Stack>

      {/* Modals */}
      <Modal 
        opened={!!editType || isAddingType} 
        onClose={() => {
          setEditType(null);
          setIsAddingType(false);
          setFormName('');
        }}
        title={editType ? 'Edit Type' : 'Add Type'}
        overlayProps={{ fixed: true }}
        keepMounted={false}
      >
        <Stack>
          <TextInput
            label="Type Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => {
                setEditType(null);
                setIsAddingType(false);
                setFormName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTypeSubmit}
              disabled={!formName.trim()}
            >
              {editType ? 'Save' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal 
        opened={!!editCategory || isAddingCategory} 
        onClose={() => {
          setEditCategory(null);
          setIsAddingCategory(false);
          setFormName('');
        }}
        title={editCategory ? 'Edit Category' : 'Add Category'}
        overlayProps={{ fixed: true }}
        keepMounted={false}
      >
        <Stack>
          <TextInput
            label="Category Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => {
                setEditCategory(null);
                setIsAddingCategory(false);
                setFormName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCategorySubmit}
              disabled={!formName.trim()}
            >
              {editCategory ? 'Save' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
} 