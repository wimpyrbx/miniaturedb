/**
 * @file ProductAdmin.tsx
 * @description Admin page for managing production companies, product lines, and product sets in a hierarchical view
 */

import { useState, useEffect } from 'react';
import { Grid, Title, Card, Button, Group, Text, Stack, Table, Modal, TextInput, Notification, Center, Loader, Box, useMantineColorScheme } from '@mantine/core';
import { IconPlus, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCompanies, getProductLines, getProductSets,
  createCompany, updateCompany,
  createProductLine, updateProductLine,
  createProductSet, updateProductSet
} from '../api/productinfo';
import type { Company, ProductLine, ProductSet } from '../types/products';
import { deleteCompany } from '../api/productinfo/companies/delete';
import { deleteProductLine } from '../api/productinfo/lines/delete';
import { deleteProductSet } from '../api/productinfo/sets/delete';
import { TableActions } from '../components/ui/tableactions/TableActions';
import { modals } from '@mantine/modals';
import { DataTable } from '../components/ui/table/DataTable';

// Simple form types
type CompanyForm = { name: string };
type ProductLineForm = { name: string; company_id: number };
type ProductSetForm = { name: string; product_line_id: number };

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

export function ProductAdmin() {
  const queryClient = useQueryClient();
  const { colorScheme } = useMantineColorScheme();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedLine, setSelectedLine] = useState<ProductLine | null>(null);

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
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [editLine, setEditLine] = useState<ProductLine | null>(null);
  const [editSet, setEditSet] = useState<ProductSet | null>(null);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [formName, setFormName] = useState('');

  // Queries
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      // First get all companies
      const companies = await getCompanies();
      
      // Then fetch lines for each company and their sets in parallel
      await Promise.all(
        companies.map(async (company) => {
          const lines = await getProductLines(company.id);
          
          // Store the lines data in the query cache
          queryClient.setQueryData(
            ['productLines', company.id],
            lines
          );

          // Fetch and cache sets for each line
          await Promise.all(
            lines.map(async (line) => {
              const sets = await getProductSets(line.id);
              // Store the sets data in the query cache
              queryClient.setQueryData(
                ['productSets', line.id],
                sets
              );
            })
          );
        })
      );
      
      return companies;
    }
  });

  const { data: productLines, isLoading: isLoadingLines } = useQuery({
    queryKey: ['productLines', selectedCompany?.id],
    queryFn: () => selectedCompany ? getProductLines(selectedCompany.id) : Promise.resolve([]),
    enabled: !!selectedCompany
  });

  const { data: productSets, isLoading: isLoadingSets } = useQuery({
    queryKey: ['productSets', selectedLine?.id],
    queryFn: () => selectedLine ? getProductSets(selectedLine.id) : Promise.resolve([]),
    enabled: !!selectedLine
  });

  // Mutations
  const companyMutation = useMutation({
    mutationFn: (data: { id?: number; name: string }) => {
      return data.id 
        ? updateCompany(data.id, { name: data.name })
        : createCompany({ name: data.name });
    },
    onSuccess: async (_, variables) => {
      // Invalidate and refetch companies
      await queryClient.invalidateQueries({ queryKey: ['companies'] });
      // Force refetch of all related data
      if (selectedCompany) {
        await queryClient.invalidateQueries({ queryKey: ['productLines', selectedCompany.id] });
        if (selectedLine) {
          await queryClient.invalidateQueries({ queryKey: ['productSets', selectedLine.id] });
        }
      }
      setEditCompany(null);
      setIsAddingCompany(false);
      setFormName('');
      setNotification({
        show: true,
        title: variables.id ? 'Company Updated' : 'Company Created',
        message: `Successfully ${variables.id ? 'updated' : 'created'} company "${variables.name}"`,
        color: 'green'
      });
    },
    onError: (error: any) => {
      setNotification({
        show: true,
        title: 'Error',
        message: error.response?.data?.error || 'Failed to save company',
        color: 'red'
      });
    }
  });

  const lineMutation = useMutation({
    mutationFn: (data: { id?: number; name: string; company_id: number }) => {
      return data.id
        ? updateProductLine(data.id, { name: data.name })
        : createProductLine({ name: data.name, company_id: data.company_id });
    },
    onSuccess: async (_, variables) => {
      // Invalidate and refetch lines for the current company
      await queryClient.invalidateQueries({ queryKey: ['productLines', selectedCompany?.id] });
      // Also refetch companies to update line counts
      await queryClient.invalidateQueries({ queryKey: ['companies'] });
      // Force refetch product sets if we have a selected line
      if (selectedLine) {
        await queryClient.invalidateQueries({ queryKey: ['productSets', selectedLine.id] });
      }
      setEditLine(null);
      setIsAddingLine(false);
      setFormName('');
      setNotification({
        show: true,
        title: variables.id ? 'Product Line Updated' : 'Product Line Created',
        message: `Successfully ${variables.id ? 'updated' : 'created'} product line "${variables.name}"`,
        color: 'green'
      });
    },
    onError: (error: any) => {
      setNotification({
        show: true,
        title: 'Error',
        message: error.response?.data?.error || 'Failed to save product line',
        color: 'red'
      });
    }
  });

  const setMutation = useMutation({
    mutationFn: (data: { id?: number; name: string; product_line_id: number }) => {
      return data.id
        ? updateProductSet(data.id, { name: data.name })
        : createProductSet({ name: data.name, product_line_id: data.product_line_id });
    },
    onSuccess: async (_, variables) => {
      // Invalidate and refetch sets for the current line
      await queryClient.invalidateQueries({ queryKey: ['productSets', selectedLine?.id] });
      // Also refetch lines to update set counts
      await queryClient.invalidateQueries({ queryKey: ['productLines', selectedCompany?.id] });
      // And companies to update all counts
      await queryClient.invalidateQueries({ queryKey: ['companies'] });
      setEditSet(null);
      setIsAddingSet(false);
      setFormName('');
      setNotification({
        show: true,
        title: variables.id ? 'Product Set Updated' : 'Product Set Created',
        message: `Successfully ${variables.id ? 'updated' : 'created'} product set "${variables.name}"`,
        color: 'green'
      });
    },
    onError: (error: any) => {
      setNotification({
        show: true,
        title: 'Error',
        message: error.response?.data?.error || 'Failed to save product set',
        color: 'red'
      });
    }
  });

  // Delete mutations
  const companyDeleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setNotification({
        show: true,
        title: 'Company Deleted',
        message: 'Successfully deleted company',
        color: 'yellow'
      });
    },
    onError: (error: any) => {
      setNotification({
        show: true,
        title: 'Error',
        message: 'Failed to delete company',
        color: 'red'
      });
    }
  });

  const lineDeleteMutation = useMutation({
    mutationFn: deleteProductLine,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['productLines', selectedCompany?.id] 
      });
      setNotification({
        show: true,
        title: 'Product Line Deleted',
        message: 'Successfully deleted product line',
        color: 'blue'
      });
    },
    onError: (error: any) => {
      setNotification({
        show: true,
        title: 'Error',
        message: 'Failed to delete product line',
        color: 'red'
      });
    }
  });

  const setDeleteMutation = useMutation({
    mutationFn: deleteProductSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['productSets', selectedLine?.id] 
      });
      setNotification({
        show: true,
        title: 'Product Set Deleted',
        message: 'Successfully deleted product set',
        color: 'blue'
      });
    },
    onError: (error: any) => {
      setNotification({
        show: true,
        title: 'Error',
        message: 'Failed to delete product set',
        color: 'red'
      });
    }
  });

  // Form handlers
  const handleCompanySubmit = () => {
    if (editCompany) {
      companyMutation.mutate({ id: editCompany.id, name: formName });
    } else {
      companyMutation.mutate({ name: formName });
    }
  };

  const handleLineSubmit = () => {
    if (!selectedCompany) return;
    if (editLine) {
      lineMutation.mutate({ id: editLine.id, name: formName, company_id: selectedCompany.id });
    } else {
      lineMutation.mutate({ name: formName, company_id: selectedCompany.id });
    }
  };

  const handleSetSubmit = () => {
    if (!selectedLine) return;
    if (editSet) {
      setMutation.mutate({ id: editSet.id, name: formName, product_line_id: selectedLine.id });
    } else {
      setMutation.mutate({ name: formName, product_line_id: selectedLine.id });
    }
  };

  // Add this before the table rendering
  const companyHasLines = (companyId: number) => {
    // Get all product lines from the cache
    const allLines = queryClient.getQueryData<ProductLine[]>(
      ['productLines', companyId]
    );
    return allLines && allLines.length > 0;
  };

  // Similarly for product lines
  const lineHasSets = (lineId: number) => {
    const allSets = queryClient.getQueryData<ProductSet[]>(
      ['productSets', lineId]
    );
    return allSets && allSets.length > 0;
  };

  // Add column definitions after the mutations
  const companyColumns = [
    { key: 'name', label: 'Name', filterable: true },
    { key: 'actions', label: '' }
  ];

  const lineColumns = [
    { key: 'name', label: 'Name', filterable: true },
    { key: 'actions', label: '' }
  ];

  const setColumns = [
    { key: 'name', label: 'Name', filterable: true },
    { key: 'actions', label: '' }
  ];

  const renderCompanyRow = (company: Company) => {
    const lineCount = queryClient.getQueryData<ProductLine[]>(
      ['productLines', company.id]
    )?.length || 0;
    
    return (
      <Table.Tr 
        key={company.id} 
        style={{ 
          cursor: 'pointer',
          backgroundColor: selectedCompany?.id === company.id ? 'var(--mantine-color-blue-light)' : undefined 
        }}
        onClick={() => {
          setSelectedCompany(company);
          setSelectedLine(null);
        }}
      >
        <Table.Td>
          {company.name}
          {lineCount > 0 && (
            <Text span size="sm" c="dimmed" ml={5}>({lineCount})</Text>
          )}
        </Table.Td>
        <Table.Td>
          <Group justify="flex-end">
            <TableActions
              elementType="icon"
              onEdit={() => {
                setEditCompany(company);
                setFormName(company.name);
              }}
              onDelete={() => {
                openDeleteConfirmModal(
                  'Company',
                  company.name,
                  () => companyDeleteMutation.mutate(company.id)
                );
              }}
              canDelete={!companyHasLines(company.id)}
              deleteTooltip="Cannot delete company that has product lines"
            />
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  };

  const renderLineRow = (line: ProductLine) => {
    const setCount = queryClient.getQueryData<ProductSet[]>(
      ['productSets', line.id]
    )?.length || 0;

    return (
      <Table.Tr 
        key={line.id}
        style={{ 
          cursor: 'pointer',
          backgroundColor: selectedLine?.id === line.id ? 'var(--mantine-color-blue-light)' : undefined 
        }}
        onClick={() => setSelectedLine(line)}
      >
        <Table.Td>
          {line.name}
          {setCount > 0 && (
            <Text span size="sm" c="dimmed" ml={5}>({setCount})</Text>
          )}
        </Table.Td>
        <Table.Td>
          <Group justify="flex-end">
            <TableActions
              elementType="icon"
              onEdit={() => {
                setEditLine(line);
                setFormName(line.name);
              }}
              onDelete={() => {
                openDeleteConfirmModal(
                  'Product Line',
                  line.name,
                  () => lineDeleteMutation.mutate(line.id)
                );
              }}
              canDelete={!lineHasSets(line.id)}
              deleteTooltip="Cannot delete product line that has product sets"
            />
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  };

  const renderSetRow = (set: ProductSet) => {
    return (
      <Table.Tr key={set.id}>
        <Table.Td>
          {set.name}
          {(set.mini_count ?? 0) > 0 && (
            <Text span size="sm" c="dimmed" ml={5}>({set.mini_count})</Text>
          )}
        </Table.Td>
        <Table.Td>
          <Group justify="flex-end">
            <TableActions
              elementType="icon"
              onEdit={() => {
                setEditSet(set);
                setFormName(set.name);
              }}
              onDelete={() => {
                openDeleteConfirmModal(
                  'Product Set',
                  set.name,
                  () => setDeleteMutation.mutate(set.id)
                );
              }}
              canDelete={!set.mini_count}
              deleteTooltip="Cannot delete product set that has minis"
            />
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  };

  return (
    <>
      <Stack p={0} gap="md">
        <Box p="xs">
          <Grid gutter="xs">
            {/* Companies Column */}
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
                    <Title order={2} size="h3" mb={5}>Companies</Title>
                    <Stack gap={2}>
                      <Text size="sm" c="dimmed">First select a company below,</Text>
                      <Text size="sm" c="dimmed">then select a product line in table to the right.</Text>
                    </Stack>
                  </div>
                  <Button 
                    size="xs"
                    variant="filled"
                    color="green"
                    leftSection={<IconPlus size={16} />}
                    onClick={() => {
                      setFormName('');
                      setIsAddingCompany(true);
                    }}
                  >
                    Add Company
                  </Button>
                </Group>
                
                <Stack p="sm">
                  {isLoadingCompanies ? (
                    <Center py="md">
                      <Loader size="sm" />
                    </Center>
                  ) : companies?.length === 0 ? (
                    <Text c="dimmed" ta="center">No companies found</Text>
                  ) : (
                    <DataTable
                      data={companies ?? []}
                      columns={companyColumns}
                      rowComponent={renderCompanyRow}
                      withPagination
                      withFiltering
                      pageSize={10}
                    />
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Product Lines Column */}
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
                    <Title order={2} size="h3" mb={5}>Product Lines</Title>
                    <Stack gap={2}>
                      {selectedCompany ? (
                        <>
                          <Text size="sm" c="dimmed">
                            Company: <Text span fw={700} c={colorScheme === 'light' ? 'dark.9' : 'white'}>{selectedCompany.name}</Text>
                          </Text>
                          <Text size="sm" c="dimmed">Select a product line below.</Text>
                        </>
                      ) : (
                        <>
                          <Text size="sm" c="dimmed">To select a product line,</Text>
                          <Text size="sm" c="dimmed">you must first select a company.</Text>
                        </>
                      )}
                    </Stack>
                  </div>
                  {selectedCompany && (
                    <Button 
                      size="xs"
                      variant="filled"
                      color="green"
                      leftSection={<IconPlus size={16} />}
                      style={{
                        position: 'absolute',
                        right: 'var(--mantine-spacing-sm)',
                        top: 'var(--mantine-spacing-sm)'
                      }}
                      onClick={() => {
                        setFormName('');
                        setIsAddingLine(true);
                      }}
                    >
                      Add Line
                    </Button>
                  )}
                </Group>
                
                <Stack p="sm">
                  {!selectedCompany ? (
                    <Text c="dimmed" ta="center">Select a company to view its product lines</Text>
                  ) : isLoadingLines ? (
                    <Center py="md">
                      <Loader size="sm" />
                    </Center>
                  ) : productLines?.length === 0 ? (
                    <Text c="dimmed" ta="center">No product lines found</Text>
                  ) : (
                    <DataTable
                      data={productLines ?? []}
                      columns={lineColumns}
                      rowComponent={renderLineRow}
                      withPagination
                      withFiltering
                      pageSize={10}
                    />
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Product Sets Column */}
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
                    <Title order={2} size="h3" mb={5}>Product Sets</Title>
                    {selectedLine ? (
                      <Stack gap={2}>
                        <Text size="sm" c="dimmed">
                          Company: <Text span fw={700} c={colorScheme === 'light' ? 'dark.9' : 'white'}>{selectedCompany?.name}</Text>
                        </Text>
                        <Text size="sm" c="dimmed">
                          Product Line: <Text span fw={700} c={colorScheme === 'light' ? 'dark.9' : 'white'}>{selectedLine.name}</Text>
                        </Text>
                      </Stack>
                    ) : (
                      <Stack gap={2}>
                        <Text size="sm" c="dimmed">To be able to see any product set you must select</Text>
                        <Text size="sm" c="dimmed">both a company and one of it's product line.</Text>
                      </Stack>
                    )}
                  </div>
                  {selectedLine && (
                    <Button 
                      size="xs"
                      variant="filled"
                      color="green"
                      leftSection={<IconPlus size={16} />}
                      onClick={() => {
                        setFormName('');
                        setIsAddingSet(true);
                      }}
                    >
                      Add Set
                    </Button>
                  )}
                </Group>
                
                <Stack p="sm">
                  {!selectedLine ? (
                    <Text c="dimmed" ta="center">Select a product line to view its sets</Text>
                  ) : isLoadingSets ? (
                    <Center py="md">
                      <Loader size="sm" />
                    </Center>
                  ) : productSets?.length === 0 ? (
                    <Text c="dimmed" ta="center">No product sets found</Text>
                  ) : (
                    <DataTable
                      data={productSets ?? []}
                      columns={setColumns}
                      rowComponent={renderSetRow}
                      withPagination
                      withFiltering
                      pageSize={10}
                    />
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Box>
      </Stack>

      {/* Modals */}
      <Modal 
        opened={!!editCompany || isAddingCompany} 
        onClose={() => {
          setEditCompany(null);
          setIsAddingCompany(false);
          setFormName('');
        }}
        title={editCompany ? 'Edit Company' : 'Add Company'}
        overlayProps={{ fixed: true }}
        keepMounted={false}
      >
        <Stack>
          <TextInput
            label="Company Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <Button onClick={handleCompanySubmit}>
            {editCompany ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </Modal>

      <Modal 
        opened={!!editLine || isAddingLine} 
        onClose={() => {
          setEditLine(null);
          setIsAddingLine(false);
          setFormName('');
        }}
        title={editLine ? 'Edit Product Line' : 'Add Product Line'}
        overlayProps={{ fixed: true }}
        keepMounted={false}
      >
        <Stack>
          <TextInput
            label="Product Line Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <Button onClick={handleLineSubmit}>
            {editLine ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </Modal>

      <Modal 
        opened={!!editSet || isAddingSet} 
        onClose={() => {
          setEditSet(null);
          setIsAddingSet(false);
          setFormName('');
        }}
        title={editSet ? 'Edit Product Set' : 'Add Product Set'}
        overlayProps={{ fixed: true }}
        keepMounted={false}
      >
        <Stack>
          <TextInput
            label="Product Set Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <Button onClick={handleSetSubmit}>
            {editSet ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </Modal>

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
    </>
  );
} 