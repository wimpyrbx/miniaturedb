/**
 * @file ClassificationAdmin.tsx
 * @description Admin page for managing miniature types and their categories in a hierarchical view
 */

import { useState, useEffect, useMemo } from 'react';
import { Grid, Title, Card, Button, Group, Text, Stack, Modal, TextInput, Notification, Center, Loader, Box, useMantineColorScheme, Table, Switch, ScrollArea, UnstyledButton, useMantineTheme } from '@mantine/core';
import { IconPlus, IconCheck, IconX, IconCircleCheck, IconCircle } from '@tabler/icons-react';
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

interface CategoryWithSelection extends MiniatureCategory {
  isSelected: boolean;
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
  const theme = useMantineTheme();
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formName, setFormName] = useState('');
  const [showOnlyWithTypeChildren, setShowOnlyWithTypeChildren] = useState(false);

  // Queries
  const { data: types, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['miniature_types'],
    queryFn: async () => {
      const [typesResponse, relationshipsResponse] = await Promise.all([
        fetch('/api/classification/types', { credentials: 'include' }),
        fetch('/api/classification/type-categories', { credentials: 'include' })
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

      // Also store empty arrays for types with no categories
      types.forEach((type: MiniatureType) => {
        if (!categoriesByType[type.id]) {
          queryClient.setQueryData(
            ['miniature_categories', type.id],
            []
          );
        }
      });

      return types;
    },
    staleTime: 30000 // Keep the data fresh for 30 seconds
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['miniature_categories', selectedType?.id],
    queryFn: async () => {
      if (!selectedType) return [];
      // Try to get from cache first
      const cached = queryClient.getQueryData<MiniatureCategory[]>(['miniature_categories', selectedType.id]);
      if (cached) return cached;

      // If not in cache, fetch from server
      const response = await fetch(`/api/classification/types/${selectedType.id}/categories`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      
      // Update the cache
      queryClient.setQueryData(['miniature_categories', selectedType.id], data);
      return data;
    },
    enabled: !!selectedType,
    staleTime: 30000 // Keep the data fresh for 30 seconds
  });

  const { data: allCategories } = useQuery({
    queryKey: ['all_categories'],
    queryFn: async () => {
      const response = await fetch('/api/classification/categories', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch all categories');
      return response.json();
    }
  });

  // Filter out categories that are already assigned to the selected type
  const categoriesWithSelection = useMemo(() => {
    if (!allCategories || !selectedType) return [];
    const assignedCategoryIds = new Set(categories?.map((c: MiniatureCategory) => c.id.toString()) || []);
    return allCategories.map((category: MiniatureCategory): CategoryWithSelection => ({
      ...category,
      isSelected: assignedCategoryIds.has(category.id.toString())
    }));
  }, [allCategories, selectedType, categories]);

  // Mutations
  const typeMutation = useMutation({
    mutationFn: async (data: { id?: number; name: string }) => {
      const response = await fetch(
        data.id ? `/api/classification/types/${data.id}` : '/api/classification/types',
        {
          method: data.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
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
    mutationFn: async (data: { typeId: number; categoryIds: number[] }) => {
      const response = await fetch(`/api/classification/types/${data.typeId}/categories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ categoryIds: data.categoryIds })
      });
      if (!response.ok) throw new Error('Failed to update category assignments');
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Set the new categories directly in the cache
      queryClient.setQueryData(
        ['miniature_categories', variables.typeId],
        data
      );
      
      // Update the type-categories relationships
      queryClient.setQueryData(
        ['type-categories'],
        (oldData: any) => oldData?.filter((cat: any) => cat.type_id !== variables.typeId) ?? []
      );
      
      // Force refetch of types to update counts
      queryClient.invalidateQueries({ 
        queryKey: ['miniature_types'],
        refetchType: 'all'
      });

      setIsAddingCategory(false);
      setSelectedCategories([]);
      
      setNotification({
        show: true,
        title: 'Categories Updated',
        message: data.length === 0 
          ? 'All categories have been removed' 
          : `Successfully updated to ${data.length} ${data.length === 1 ? 'category' : 'categories'}`,
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
        method: 'DELETE',
        credentials: 'include'
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
    mutationFn: async ({ categoryId, typeId }: { categoryId: number; typeId: number }) => {
      const response = await fetch(`/api/classification/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete category');
      return { categoryId, typeId };
    },
    onSuccess: (data) => {
      // Update the categories for this type directly in the cache
      queryClient.setQueryData(
        ['miniature_categories', data.typeId],
        (oldData: MiniatureCategory[] | undefined) => 
          oldData?.filter(cat => cat.id !== data.categoryId) ?? []
      );
      
      // Update the type-categories relationships
      queryClient.setQueryData(
        ['type-categories'],
        (oldData: MiniatureCategory[] | undefined) =>
          oldData?.filter(cat => cat.id !== data.categoryId) ?? []
      );
      
      // Update all categories list
      queryClient.setQueryData(
        ['all_categories'],
        (oldData: MiniatureCategory[] | undefined) =>
          oldData?.filter(cat => cat.id !== data.categoryId) ?? []
      );
      
      // Force refetch of types to update counts
      queryClient.invalidateQueries({ queryKey: ['miniature_types'] });

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
      // This block can be removed since we no longer support editing
    } else {
      // This block can be removed since we no longer support individual category creation
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
            onDelete={() => {
              openDeleteConfirmModal(
                'Category',
                category.name,
                () => categoryDeleteMutation.mutate({ categoryId: category.id, typeId: selectedType!.id })
              );
            }}
            hideEdit
            onEdit={() => {}}
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
                        const currentCategoryIds = categories?.map(c => c.id.toString()) || [];
                        setSelectedCategories(currentCategoryIds);
                      }}
                      style={{
                        position: 'absolute',
                        right: 'var(--mantine-spacing-sm)',
                        top: 'var(--mantine-spacing-sm)'
                      }}
                    >
                      Manage Categories
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
        opened={isAddingCategory}
        onClose={() => {
          setIsAddingCategory(false);
          setSelectedCategories([]);
        }}
        title="Add Categories"
        size="lg"
        styles={{
          title: {
            fontSize: '1.2rem',
            fontWeight: 600
          },
          body: {
            paddingTop: 0,
            paddingBottom: 'var(--mantine-spacing-xs)'
          },
          header: {
            paddingBottom: 'var(--mantine-spacing-xs)'
          },
          inner: {
            padding: 'var(--mantine-spacing-xs)'
          }
        }}
        centered
      >
        <Stack>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (selectedType) {
              categoryMutation.mutate({
                typeId: selectedType.id,
                categoryIds: selectedCategories.map(id => parseInt(id))
              });
            }
          }}>
            {isAddingCategory && (
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Select categories to assign to type <Text span fw={600}>{selectedType?.name}</Text></Text>
                <Box style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                  <Group px="xs" py={6}>
                    <Text size="sm" fw={600} style={{ flex: 1 }}>Category Name</Text>
                  </Group>
                </Box>
                <ScrollArea h={400}>
                  <Stack gap={4} p="xs">
                    {categoriesWithSelection.map((category: CategoryWithSelection) => (
                      <UnstyledButton
                        key={category.id}
                        onClick={() => {
                          const categoryId = category.id.toString();
                          if (selectedCategories.includes(categoryId)) {
                            setSelectedCategories(prev => prev.filter(id => id !== categoryId));
                          } else {
                            setSelectedCategories(prev => [...prev, categoryId]);
                          }
                        }}
                        style={{
                          padding: '3px 4px',
                          borderRadius: theme.radius.sm,
                          border: `1px solid ${
                            colorScheme === 'dark' 
                              ? theme.colors.dark[5] 
                              : theme.colors.gray[3]
                          }`,
                          backgroundColor: selectedCategories.includes(category.id.toString())
                            ? colorScheme === 'dark'
                              ? theme.colors.green[9]
                              : theme.colors.green[0]
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: selectedCategories.includes(category.id.toString())
                              ? colorScheme === 'dark'
                                ? theme.colors.green[8]
                                : theme.colors.green[1]
                              : colorScheme === 'dark'
                                ? theme.colors.dark[5]
                                : theme.colors.gray[0]
                          },
                          transition: 'all 500ms ease'
                        }}
                      >
                        <Group gap="xs" style={{ flex: 1 }}>
                          {selectedCategories.includes(category.id.toString()) ? (
                            <IconCircleCheck 
                              size={16} 
                              style={{ 
                                color: colorScheme === 'dark' 
                                  ? theme.colors.green[4]
                                  : theme.colors.green[6],
                                strokeWidth: 2.5
                              }} 
                            />
                          ) : (
                            <IconCircle 
                              size={16} 
                              style={{ 
                                color: colorScheme === 'dark'
                                  ? theme.colors.dark[3]
                                  : theme.colors.gray[4],
                                strokeWidth: 1.5
                              }} 
                            />
                          )}
                          <Text 
                            size="sm" 
                            fw={selectedCategories.includes(category.id.toString()) ? 600 : 500}
                            c={selectedCategories.includes(category.id.toString())
                              ? colorScheme === 'dark'
                                ? 'green.4'
                                : 'green.7'
                              : undefined}
                            style={{ flex: 1 }}
                          >
                            {category.name}
                          </Text>
                        </Group>
                      </UnstyledButton>
                    ))}
                  </Stack>
                </ScrollArea>
                <Group justify="space-between" align="center" pt="xs">
                  <Text size="sm" c="dimmed">
                    {selectedCategories.length === 0 
                      ? "No categories selected" 
                      : `${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'} selected`
                    }
                  </Text>
                  <Group>
                    <Button 
                      variant="default" 
                      onClick={() => {
                        setIsAddingCategory(false);
                        setSelectedCategories([]);
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      size="sm"
                      color="green"
                    >
                      Save Changes
                    </Button>
                  </Group>
                </Group>
                {categoriesWithSelection.length === 0 && (
                  <Text c="dimmed" ta="center" fz="sm">No categories available</Text>
                )}
              </Stack>
            )}
          </form>
        </Stack>
      </Modal>
    </>
  );
} 