/**
 * @file ProductAdmin.tsx
 * @description Admin page for managing production companies, product lines, and product sets in a hierarchical view
 */

import { useState } from 'react';
import { Grid, Title, Card, Button, Group, Text, Stack, Table } from '@mantine/core';
import { IconPlus, IconEdit } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getCompanies, getProductLines, getProductSets } from '../api/companies/get';
import type { Company, ProductLine, ProductSet } from '../types/products';

export function ProductAdmin() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedLine, setSelectedLine] = useState<ProductLine | null>(null);

  // Fetch companies
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies
  });

  // Fetch product lines when a company is selected
  const { data: productLines, isLoading: isLoadingLines } = useQuery({
    queryKey: ['productLines', selectedCompany?.id],
    queryFn: () => selectedCompany ? getProductLines(selectedCompany.id) : Promise.resolve([]),
    enabled: !!selectedCompany
  });

  // Fetch product sets when a line is selected
  const { data: productSets, isLoading: isLoadingSets } = useQuery({
    queryKey: ['productSets', selectedLine?.id],
    queryFn: () => selectedLine ? getProductSets(selectedLine.id) : Promise.resolve([]),
    enabled: !!selectedLine
  });

  return (
    <Stack p="md" gap="md">
      <Title order={1}>Product Management</Title>
      
      <Grid gutter="md">
        {/* Companies Column */}
        <Grid.Col span={4}>
          <Card withBorder shadow="sm">
            <Group justify="space-between" mb="md">
              <Title order={2} size="h3">Companies</Title>
              <Button size="sm" leftSection={<IconPlus size={16} />}>
                Add Company
              </Button>
            </Group>
            
            {isLoadingCompanies ? (
              <Text ta="center">Loading companies...</Text>
            ) : companies?.length === 0 ? (
              <Text c="dimmed" ta="center">No companies found</Text>
            ) : (
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th style={{ width: 100 }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {companies?.map(company => (
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
                      <Table.Td>{company.name}</Table.Td>
                      <Table.Td>
                        <Button 
                          variant="subtle" 
                          size="xs"
                          color="gray"
                          leftSection={<IconEdit size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Open edit modal
                          }}
                        >
                          Edit
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </Grid.Col>

        {/* Product Lines Column */}
        <Grid.Col span={4}>
          <Card withBorder shadow="sm">
            <Group justify="space-between" mb="md">
              <Title order={2} size="h3">Product Lines</Title>
              <Button 
                size="sm" 
                leftSection={<IconPlus size={16} />}
                disabled={!selectedCompany}
              >
                Add Line
              </Button>
            </Group>
            
            {!selectedCompany ? (
              <Text c="dimmed" ta="center">Select a company to view its product lines</Text>
            ) : isLoadingLines ? (
              <Text ta="center">Loading product lines...</Text>
            ) : productLines?.length === 0 ? (
              <Text c="dimmed" ta="center">No product lines found</Text>
            ) : (
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th style={{ width: 100 }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {productLines?.map(line => (
                    <Table.Tr 
                      key={line.id}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedLine?.id === line.id ? 'var(--mantine-color-blue-light)' : undefined 
                      }}
                      onClick={() => setSelectedLine(line)}
                    >
                      <Table.Td>{line.name}</Table.Td>
                      <Table.Td>
                        <Button 
                          variant="subtle" 
                          size="xs"
                          color="gray"
                          leftSection={<IconEdit size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Open edit modal
                          }}
                        >
                          Edit
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </Grid.Col>

        {/* Product Sets Column */}
        <Grid.Col span={4}>
          <Card withBorder shadow="sm">
            <Group justify="space-between" mb="md">
              <Title order={2} size="h3">Product Sets</Title>
              <Button 
                size="sm" 
                leftSection={<IconPlus size={16} />}
                disabled={!selectedLine}
              >
                Add Set
              </Button>
            </Group>
            
            {!selectedLine ? (
              <Text c="dimmed" ta="center">Select a product line to view its sets</Text>
            ) : isLoadingSets ? (
              <Text ta="center">Loading product sets...</Text>
            ) : productSets?.length === 0 ? (
              <Text c="dimmed" ta="center">No product sets found</Text>
            ) : (
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th style={{ width: 100 }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {productSets?.map(set => (
                    <Table.Tr key={set.id}>
                      <Table.Td>{set.name}</Table.Td>
                      <Table.Td>
                        <Button 
                          variant="subtle" 
                          size="xs"
                          color="gray"
                          leftSection={<IconEdit size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Open edit modal
                          }}
                        >
                          Edit
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
} 