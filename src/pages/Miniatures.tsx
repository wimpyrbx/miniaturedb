import React, { useMemo, useRef, useEffect } from 'react';
import { useState } from 'react';
import { Stack, Title, Text, Group, Card, Modal, Button, TextInput, MultiSelect, Select, Textarea, NumberInput, useMantineColorScheme, Radio, TagsInput, Badge, Center, Loader, SegmentedControl, Pagination, Box } from '@mantine/core';
import { DataTable } from '../components/ui/table/DataTable';
import { Table } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TableActions } from '../components/ui/tableactions/TableActions';
import { IconEdit, IconPlus, IconPhoto, IconTable, IconLayoutGrid, IconLayoutList, IconSearch, IconPackage } from '@tabler/icons-react';
import { AdminModal } from '../components/AdminModal';

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
        <Badge
          variant="outline"
          color="gray"
          size="sm"
          style={{ cursor: 'pointer' }}
          onClick={() => setIsExpanded(true)}
        >
          +{remaining} more
        </Badge>
      )}
      {isExpanded && hasMore && (
        <Badge
          variant="outline"
          color="gray"
          size="sm"
          style={{ cursor: 'pointer' }}
          onClick={() => setIsExpanded(false)}
        >
          Show less
        </Badge>
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

type ViewType = 'table' | 'cards' | 'banner';

const ITEMS_PER_PAGE = 10;

const TableView = ({ minis, onEdit, currentPage, onPageChange }: { 
  minis: Mini[], 
  onEdit: (mini: Mini) => void,
  currentPage: number,
  onPageChange: (page: number) => void
}) => {
  const paginatedMinis = minis.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            <Text size="xs" style={{ fontStyle: 'italic' }}>
              {[mini.company_name, mini.product_line_name, mini.product_set_name]
                .filter(Boolean)
                .map((text, index, arr) => (
                  <React.Fragment key={index}>
                    <span style={{ color: 'var(--mantine-color-primary-6)', opacity: 0.8 }}>{text}</span>
                    {index < arr.length - 1 && ' » '}
                  </React.Fragment>
                ))
              }
            </Text>
          </Group>
        </Stack>
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
      <Table.Td style={{ width: '250px' }}>
        <Stack gap={2}>
          <Group gap="xs" align="center">
            <Text size="xs" fw={500} c="dimmed">Location:</Text>
            <Text size="xs" fw={500} c="primary.4">{mini.location}</Text>
          </Group>
          <Group gap="xs" align="center">
            <Text size="xs" fw={500} c="dimmed">Painted By:</Text>
            <Text size="xs" fw={500} c="primary.4">
              {mini.painted_by_name ? mini.painted_by_name.charAt(0).toUpperCase() + mini.painted_by_name.slice(1) : '-'}
            </Text>
          </Group>
          <Group gap="xs" align="center">
            <Text size="xs" fw={500} c="dimmed">Base Size:</Text>
            <Text size="xs" fw={500} c="primary.4">
              {mini.base_size_name 
                ? mini.base_size_name.charAt(0).toUpperCase() + mini.base_size_name.slice(1).toLowerCase() 
                : '-'}
            </Text>
          </Group>
        </Stack>
      </Table.Td>
      <Table.Td style={{ width: '70px', padding: 'var(--mantine-spacing-xs)' }}>
        <Group justify="flex-end" wrap="nowrap">
          <TableActions
            elementType="icon"
            onEdit={() => onEdit(mini)}
            onDelete={() => {}}
          />
        </Group>
      </Table.Td>
    </Table.Tr>
  );

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
            <Text size="xs" style={{ fontStyle: 'italic' }}>
              {[mini.company_name, mini.product_line_name, mini.product_set_name]
                .filter(Boolean)
                .map((text, index, arr) => (
                  <React.Fragment key={index}>
                    <span style={{ color: 'var(--mantine-color-primary-6)', opacity: 0.8 }}>{text}</span>
                    {index < arr.length - 1 && ' » '}
                  </React.Fragment>
                ))
              }
            </Text>
          </Group>
        </Stack>
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
      key: 'information', 
      label: 'Information', 
      width: 250,
      filterable: true,
      render: (mini: Mini) => (
        <Stack gap={2}>
          <Group gap="xs" align="center">
            <Text size="xs" fw={500} c="dimmed">Location:</Text>
            <Text size="xs" fw={500} c="primary.4">{mini.location}</Text>
          </Group>
          <Group gap="xs" align="center">
            <Text size="xs" fw={500} c="dimmed">Painted By:</Text>
            <Text size="xs" fw={500} c="primary.4">
              {mini.painted_by_name ? mini.painted_by_name.charAt(0).toUpperCase() + mini.painted_by_name.slice(1) : '-'}
            </Text>
          </Group>
          <Group gap="xs" align="center">
            <Text size="xs" fw={500} c="dimmed">Base Size:</Text>
            <Text size="xs" fw={500} c="primary.4">
              {mini.base_size_name 
                ? mini.base_size_name.charAt(0).toUpperCase() + mini.base_size_name.slice(1).toLowerCase() 
                : '-'}
            </Text>
          </Group>
        </Stack>
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
            onEdit={() => onEdit(mini)}
            onDelete={() => {}}
          />
        </Group>
      )
    }
  ];

  return (
    <Stack>
      <DataTable
        data={paginatedMinis}
        columns={columns}
        rowComponent={RowComponent}
      />
    </Stack>
  );
};

const CardsView = ({ minis, onEdit, currentPage, onPageChange }: { 
  minis: Mini[], 
  onEdit: (mini: Mini) => void,
  currentPage: number,
  onPageChange: (page: number) => void
}) => {
  const paginatedMinis = minis.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Stack>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 'var(--mantine-spacing-xs)'
      }}>
        {paginatedMinis.map(mini => (
          <Card 
            key={mini.id} 
            shadow="sm" 
            padding="xs"
            withBorder
            style={{
              transition: 'all 200ms ease',
              position: 'relative'
            }}
            component="div"
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'scale(1.04)';
              target.style.boxShadow = '0 0 20px 0 var(--mantine-color-primary-dark)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'none';
              target.style.boxShadow = 'var(--mantine-shadow-sm)';
            }}
          >
            <Card.Section style={{ position: 'relative' }}>
              <Button 
                variant="light" 
                size="xs" 
                onClick={() => onEdit(mini)}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  padding: '4px',
                  minWidth: 0,
                  width: '28px',
                  height: '28px'
                }}
              >
                <IconEdit size={14} />
              </Button>
              <div style={{ 
                height: '160px',
                backgroundColor: 'var(--mantine-color-dark-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <IconPhoto size={48} style={{ opacity: 0.5 }} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '8px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                  zIndex: 1
                }}>
                  <PillsList 
                    items={mini.types.filter(type => !type.proxy_type)} 
                    color="teal"
                  />
                </div>
              </div>
            </Card.Section>
            <Stack gap="xs" mt="xs">
              <Group justify="space-between" align="flex-start">
                <Text fw={500} size="lg" style={{ lineHeight: 1.1 }}>{mini.name}</Text>
                <Group gap={4}>
                  <Text size="xs" c="dimmed" style={{ 
                    padding: '4px 8px',
                    border: '1px solid var(--mantine-color-dark-4)',
                    borderRadius: 'var(--mantine-radius-sm)',
                    backgroundColor: 'var(--mantine-color-dark-7)',
                    whiteSpace: 'nowrap',
                    color: 'var(--mantine-color-primary-4)'
                  }}>
                    {mini.base_size_name || 'No Base'}
                  </Text>
                </Group>
              </Group>

              {mini.types.some(type => type.proxy_type) && (
                <PillsList 
                  items={mini.types.filter(type => type.proxy_type)} 
                  color="blue"
                />
              )}

              {mini.category_names.length > 0 && (
                <PillsList 
                  items={mini.category_names} 
                  color="violet" 
                />
              )}

              <Group gap="xs" mt="xs">
                <Text size="xs" c="var(--mantine-color-primary)">
                  <Text size="xs" span inherit c="var(--mantine-color-primary-3)" fw={500}>Location:</Text> {mini.location}
                </Text>
                {mini.painted_by_name && (
                  <Text size="xs" c="var(--mantine-color-primary)">
                    <Text size="xs" span inherit c="var(--mantine-color-primary-3)" fw={500}>Painted by:</Text> {mini.painted_by_name}
                  </Text>
                )}
              </Group>
            </Stack>
          </Card>
        ))}
      </div>
    </Stack>
  );
};

const BannerView = ({ minis, onEdit, currentPage, onPageChange }: { 
  minis: Mini[], 
  onEdit: (mini: Mini) => void,
  currentPage: number,
  onPageChange: (page: number) => void
}) => {
  const paginatedMinis = minis.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Stack>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--mantine-spacing-xs)'
      }}>
        {paginatedMinis.map(mini => (
          <Card 
            key={mini.id} 
            shadow="sm" 
            padding="xs"
            withBorder
            style={{
              transition: 'all 200ms ease',
            }}
            component="div"
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'scale(1.02)';
              target.style.zIndex = '100';
              target.style.boxShadow = '0 0 20px 0 var(--mantine-color-primary-light)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'none';
              target.style.zIndex = '';
              target.style.boxShadow = 'var(--mantine-shadow-sm)';
            }}
          >
            <Group wrap="nowrap" align="flex-start" gap="sm">
              {/* Image Section */}
              <div style={{ 
                width: '120px',
                height: '120px',
                backgroundColor: 'var(--mantine-color-dark-4)',
                borderRadius: 'var(--mantine-radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative'
              }}>
                <Button 
                  variant="light" 
                  size="xs" 
                  onClick={() => onEdit(mini)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    padding: '4px',
                    minWidth: 0,
                    width: '28px',
                    height: '28px'
                  }}
                >
                  <IconEdit size={14} />
                </Button>
                <IconPhoto size={32} style={{ opacity: 0.5 }} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '4px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                  zIndex: 1
                }}>
                  <PillsList 
                    items={mini.types.filter(type => !type.proxy_type)} 
                    color="teal"
                  />
                </div>
              </div>

              {/* Content Section */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Title and Product Info */}
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    alignItems: 'flex-end'
                  }}>
                    <Text size="xs" c="dimmed" style={{ 
                      padding: '4px 8px',
                      border: '1px solid var(--mantine-color-dark-4)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      backgroundColor: 'var(--mantine-color-dark-7)',
                      whiteSpace: 'nowrap',
                      color: 'var(--mantine-color-primary-4)'
                    }}>
                      {mini.base_size_name 
                        ? mini.base_size_name.charAt(0).toUpperCase() + mini.base_size_name.slice(1).toLowerCase() 
                        : 'No Base'}
                    </Text>
                    <Text size="xs" c="dimmed" style={{ 
                      padding: '4px 8px',
                      border: '1px solid var(--mantine-color-dark-4)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      backgroundColor: 'var(--mantine-color-dark-6)',
                      whiteSpace: 'nowrap',
                      color: 'var(--mantine-color-primary-4)'
                    }}>
                      {mini.location}
                    </Text>
                    {mini.painted_by_name && (
                      <Text size="xs" c="dimmed" style={{ 
                        padding: '4px 8px',
                        border: '1px solid var(--mantine-color-dark-4)',
                        borderRadius: 'var(--mantine-radius-sm)',
                        backgroundColor: 'var(--mantine-color-dark-5)',
                        whiteSpace: 'nowrap',
                        color: 'var(--mantine-color-primary-4)'
                      }}>
                        {mini.painted_by_name}
                      </Text>
                    )}
                  </div>

                  <Text fw={500} size="lg" style={{ lineHeight: 1.1, marginBottom: 6, paddingRight: '150px' }}>{mini.name}</Text>
                  <Text size="xs" style={{ fontStyle: 'italic', marginBottom: 4 }} lineClamp={1}>
                    {[mini.company_name, mini.product_line_name, mini.product_set_name]
                      .filter(Boolean)
                      .map((text, index, arr) => (
                        <React.Fragment key={index}>
                          <span style={{ color: 'var(--mantine-color-primary-6)', opacity: 0.8 }}>{text}</span>
                          {index < arr.length - 1 && ' » '}
                        </React.Fragment>
                      ))
                    }
                  </Text>
                </div>

                {/* Classifications */}
                <Stack gap={1}>
                  {mini.types.some(type => type.proxy_type) && (
                    <Group gap={4} style={{ minHeight: '20px' }}>
                      <PillsList 
                        items={mini.types.filter(type => type.proxy_type)} 
                        color="blue"
                      />
                    </Group>
                  )}

                  {mini.category_names.length > 0 && (
                    <Group gap={4} style={{ minHeight: '20px' }}>
                      <PillsList 
                        items={mini.category_names} 
                        color="violet" 
                      />
                    </Group>
                  )}

                  {mini.tags && mini.tags.length > 0 && (
                    <Group gap={4} style={{ minHeight: '20px' }}>
                      <PillsList
                        items={mini.tags}
                        color="pink"
                      />
                    </Group>
                  )}
                </Stack>
              </div>
            </Group>
          </Card>
        ))}
      </div>
    </Stack>
  );
};

const MiniatureModal = ({ opened, onClose, miniature }: MiniatureModalProps) => {
  // ... existing state and hooks ...

  return (
    <AdminModal
      opened={opened}
      onClose={onClose}
      title="Miniature Details"
      fullScreen
      icon={<IconPackage size={24} color="white" />}
    >
      <form onSubmit={(e) => e.preventDefault()}>
        <Group grow align="flex-start">
          {/* Rest of your form content */}
        </Group>
      </form>
    </AdminModal>
  );
};

export default function Miniatures() {
  const queryClient = useQueryClient();
  const { colorScheme } = useMantineColorScheme();
  const [editingMini, setEditingMini] = useState<Mini | null>(null);
  const [isAddingMini, setIsAddingMini] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const filterInputRef = useRef<HTMLInputElement>(null);

  // Focus the filter input
  const focusFilterInput = () => {
    setTimeout(() => {
      filterInputRef.current?.focus();
    }, 100);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    focusFilterInput();
  };

  // Handle view type change
  const handleViewChange = (value: string) => {
    setViewType(value as ViewType);
    focusFilterInput();
  };

  // Focus on initial load
  useEffect(() => {
    focusFilterInput();
  }, []);

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

  const filteredMinis = useMemo(() => {
    if (!minis) return [];
    if (!filterText) return minis;

    const searchText = filterText.toLowerCase();
    return minis.filter(mini => {
      return (
        mini.name.toLowerCase().includes(searchText) ||
        mini.company_name?.toLowerCase().includes(searchText) ||
        mini.product_line_name?.toLowerCase().includes(searchText) ||
        mini.product_set_name?.toLowerCase().includes(searchText) ||
        mini.description?.toLowerCase().includes(searchText) ||
        mini.location?.toLowerCase().includes(searchText) ||
        mini.types.some(type => type.name.toLowerCase().includes(searchText)) ||
        mini.category_names.some(cat => cat.toLowerCase().includes(searchText)) ||
        mini.tags?.some(tag => tag.name.toLowerCase().includes(searchText))
      );
    });
  }, [minis, filterText]);

  const renderView = () => {
    if (isLoadingMinis) {
      return (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      );
    }

    if (!filteredMinis?.length) {
      return <Text c="dimmed" ta="center">No miniatures found</Text>;
    }

    const viewProps = {
      minis: filteredMinis || [],
      onEdit: setEditingMini,
      currentPage,
      onPageChange: handlePageChange
    };

    return (() => {
      switch (viewType) {
        case 'cards':
          return <CardsView {...viewProps} />;
        case 'banner':
          return <BannerView {...viewProps} />;
        default:
          return <TableView {...viewProps} />;
      }
    })();
  };

  const totalPages = Math.ceil((filteredMinis?.length || 0) / ITEMS_PER_PAGE);

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
            <Text size="sm" c="dimmed">Click 'Add Miniature' to add a new miniature.</Text>
            <Text size="sm" c="dimmed">Manage your existing miniature collection below.</Text>
          </div>
          <Group>
            <SegmentedControl
              size="xs"
              data={[
                { value: 'table', label: <Center><IconTable size={16} /><Box ml={8}>Table</Box></Center> },
                { value: 'cards', label: <Center><IconLayoutGrid size={16} /><Box ml={8}>Cards</Box></Center> },
                { value: 'banner', label: <Center><IconLayoutList size={16} /><Box ml={8}>Banner</Box></Center> }
              ]}
              value={viewType}
              onChange={handleViewChange}
            />
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
        </Group>

        <Stack p="sm">
          <TextInput
            ref={filterInputRef}
            placeholder="Search..."
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1);
            }}
            leftSection={<IconSearch size={16} style={{ opacity: 0.5 }} />}
            styles={{
              input: {
                backgroundColor: 'var(--mantine-color-dark-6)',
                '&:focus': {
                  backgroundColor: 'var(--mantine-color-dark-5)',
                }
              }
            }}
          />
          {renderView()}
        </Stack>
      </Card>

      {totalPages > 1 && (
        <Group justify="center">
          <Pagination 
            value={currentPage}
            onChange={handlePageChange}
            total={totalPages}
          />
        </Group>
      )}

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