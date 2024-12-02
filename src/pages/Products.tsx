import { Button, Group, Stack, Text, Card, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Company, ProductLine, ProductSet } from '../types/products';
import api from '../api/client';
import { ProductModal } from '../components/modals/ProductModal';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

interface Company {
  id: number;
  name: string;
}

interface ProductLine {
  id: number;
  name: string;
  company_id: number;
}

interface ProductSet {
  id: number;
  name: string;
  product_line_id: number;
}

export function Products() {
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [modalType, setModalType] = useState<'company' | 'line' | 'set'>('company');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Company | ProductLine | ProductSet | null>(null);

  const openModal = () => {
    console.log('Opening modal');
    setModalOpen(true);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setModalOpen(false);
    setEditingItem(null);
  };

  // Queries
  const { data: companies } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/api/companies');
      return response.data;
    }
  });

  const { data: productLines } = useQuery<ProductLine[]>({
    queryKey: ['productLines', selectedCompany],
    queryFn: async () => {
      if (!selectedCompany) return [];
      const response = await api.get(`/api/companies/${selectedCompany}/lines`);
      return response.data;
    },
    enabled: !!selectedCompany
  });

  const { data: productSets } = useQuery<ProductSet[]>({
    queryKey: ['productSets', selectedLine],
    queryFn: async () => {
      if (!selectedLine) return [];
      const response = await api.get(`/api/product-lines/${selectedLine}/sets`);
      return response.data;
    },
    enabled: !!selectedLine
  });

  // Mutations
  const addCompanyMutation = useMutation({
    mutationFn: (data: { name: string }) => api.post('/api/companies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      notifications.show({
        title: 'Success',
        message: 'Company added successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      console.error('Add company error:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to add company',
        color: 'red'
      });
    }
  });

  const editCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => 
      api.put(`/api/companies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      notifications.show({
        title: 'Success',
        message: 'Company updated successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      console.error('Edit company error:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update company',
        color: 'red'
      });
    }
  });

  const addLineMutation = useMutation({
    mutationFn: (data: { name: string; company_id: number }) => 
      api.post('/api/companies/lines', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productLines'] });
      notifications.show({
        title: 'Success',
        message: 'Product line added successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      console.error('Add line error:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to add product line',
        color: 'red'
      });
    }
  });

  const editLineMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => 
      api.put(`/api/lines/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productLines'] });
      notifications.show({
        title: 'Success',
        message: 'Product line updated successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      console.error('Edit line error:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update product line',
        color: 'red'
      });
    }
  });

  const addSetMutation = useMutation({
    mutationFn: (data: { name: string; product_line_id: number }) => 
      api.post('/api/lines/product_sets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productSets'] });
      notifications.show({
        title: 'Success',
        message: 'Product set added successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      console.error('Add set error:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to add product set',
        color: 'red'
      });
    }
  });

  const editSetMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => 
      api.put(`/api/product_sets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productSets'] });
      notifications.show({
        title: 'Success',
        message: 'Product set updated successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      console.error('Edit set error:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update product set',
        color: 'red'
      });
    }
  });

  const handleAdd = (type: 'company' | 'line' | 'set') => {
    console.log('handleAdd called with type:', type);
    setModalType(type);
    setEditingItem(null);
    openModal();
  };

  const handleEdit = (type: 'company' | 'line' | 'set', item: Company | ProductLine | ProductSet) => {
    console.log('handleEdit called with type:', type, 'item:', item);
    setModalType(type);
    setEditingItem(item);
    openModal();
  };

  const handleSubmit = async (data: any) => {
    console.log('handleSubmit called with data:', data);
    try {
      if (editingItem) {
        // Edit mode
        switch (modalType) {
          case 'company':
            await editCompanyMutation.mutateAsync({ id: editingItem.id, data });
            break;
          case 'line':
            await editLineMutation.mutateAsync({ id: editingItem.id, data });
            break;
          case 'set':
            await editSetMutation.mutateAsync({ id: editingItem.id, data });
            break;
        }
      } else {
        // Add mode
        switch (modalType) {
          case 'company':
            await addCompanyMutation.mutateAsync(data);
            break;
          case 'line':
            if (!selectedCompany) {
              throw new Error('No company selected');
            }
            await addLineMutation.mutateAsync({ ...data, company_id: selectedCompany });
            break;
          case 'set':
            if (!selectedLine) {
              throw new Error('No product line selected');
            }
            await addSetMutation.mutateAsync({ ...data, product_line_id: selectedLine });
            break;
        }
      }
      closeModal();
    } catch (error: any) {
      console.error('Submit error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'An error occurred',
        color: 'red'
      });
    }
  };

  // Get selected item names
  const selectedCompanyName = companies?.find(c => c.id === selectedCompany)?.name;
  const selectedLineName = productLines?.find(l => l.id === selectedLine)?.name;

  return (
    <Stack gap="lg">
      <Title order={2}>Product Management</Title>

      <Group grow align="flex-start">
        {/* Companies Column */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section inheritPadding py="xs">
            <Group justify="space-between">
              <Text fw={500}>Companies</Text>
              <Button 
                size="xs"
                leftSection={<IconPlus size={16} />}
                onClick={() => handleAdd('company')}
              >
                Add Company
              </Button>
            </Group>
          </Card.Section>
          <ScrollArea h={400}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th style={{ width: 80 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {companies?.map((company) => (
                  <Table.Tr 
                    key={company.id} 
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedCompany === company.id 
                        ? theme.colors[theme.primaryColor][1]
                        : undefined
                    }}
                    onClick={() => {
                      setSelectedCompany(company.id);
                      setSelectedLine(null);
                    }}
                  >
                    <Table.Td>{company.name}</Table.Td>
                    <Table.Td>
                      <ActionIcon 
                        variant="light" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit('company', company);
                        }}
                        size="sm"
                      >
                        <IconEdit size="1rem" />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>

        {/* Product Lines Column */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section inheritPadding py="xs">
            <Group justify="space-between">
              <Text fw={500}>
                {selectedCompanyName && (
                  <Text size="sm" c="dimmed">Company: {selectedCompanyName}</Text>
                )}
                Product Lines
              </Text>
              <Button 
                size="xs"
                leftSection={<IconPlus size={16} />}
                onClick={() => handleAdd('line')}
                disabled={!selectedCompany}
              >
                Add Line
              </Button>
            </Group>
          </Card.Section>
          <ScrollArea h={400}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th style={{ width: 80 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {productLines?.map((line) => (
                  <Table.Tr 
                    key={line.id}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedLine === line.id 
                        ? theme.colors[theme.primaryColor][1]
                        : undefined
                    }}
                    onClick={() => setSelectedLine(line.id)}
                  >
                    <Table.Td>{line.name}</Table.Td>
                    <Table.Td>
                      <ActionIcon 
                        variant="light" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit('line', line);
                        }}
                        size="sm"
                      >
                        <IconEdit size="1rem" />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>

        {/* Product Sets Column */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Card.Section inheritPadding py="xs">
            <Group justify="space-between">
              <Text fw={500}>
                {selectedCompanyName && selectedLineName && (
                  <>
                    <Text size="sm" c="dimmed">Company: {selectedCompanyName}</Text>
                    <Text size="sm" c="dimmed">Product Line: {selectedLineName}</Text>
                  </>
                )}
                Product Sets
              </Text>
              <Button 
                size="xs"
                leftSection={<IconPlus size={16} />}
                onClick={() => handleAdd('set')}
                disabled={!selectedLine}
              >
                Add Set
              </Button>
            </Group>
          </Card.Section>
          <ScrollArea h={400}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th style={{ width: 80 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {productSets?.map((set) => (
                  <Table.Tr 
                    key={set.id}
                    style={{ 
                      cursor: 'pointer'
                    }}
                  >
                    <Table.Td>{set.name}</Table.Td>
                    <Table.Td>
                      <ActionIcon 
                        variant="light" 
                        onClick={() => handleEdit('set', set)}
                        size="sm"
                      >
                        <IconEdit size="1rem" />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      </Group>

      <ProductModal
        type={modalType}
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingItem}
        parentId={modalType === 'line' ? selectedCompany || undefined : selectedLine || undefined}
      />
    </Stack>
  );
} 