import React, { useMemo, useRef, useEffect } from 'react';
import { useState } from 'react';
import { Stack, Title, Text, Group, Card, Button, TextInput, MultiSelect, Select, Textarea, NumberInput, useMantineColorScheme, Radio, TagsInput, Badge, Center, Loader, SegmentedControl, Pagination, Box, Grid } from '@mantine/core';
import { DataTable } from '../components/ui/table/DataTable';
import { Table } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TableActions } from '../components/ui/tableactions/TableActions';
import { IconEdit, IconPlus, IconPhoto, IconTable, IconLayoutGrid, IconLayoutList, IconSearch, IconPackage, IconTrash } from '@tabler/icons-react';
import { AdminModal } from '../components/AdminModal';
import { getMiniatureImagePath, checkMiniatureImageStatus, uploadMiniatureImage, deleteMiniatureImage, ImageStatus } from '../utils/imageUtils';
import { modals } from '@mantine/modals';
import { getProductSets } from '../api/productinfo/sets/get';

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
  imageStatus?: ImageStatus;
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

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ width: '80px' }}>Image</Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th>Location</Table.Th>
          <Table.Th>Base Size</Table.Th>
          <Table.Th>Painted By</Table.Th>
          <Table.Th style={{ width: '80px' }}>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {paginatedMinis.map((mini) => (
          <Table.Tr key={mini.id}>
            <Table.Td>
              <div style={{ 
                width: '60px',
                height: '60px',
                backgroundColor: 'var(--mantine-color-dark-4)',
                borderRadius: 'var(--mantine-radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {mini.imageStatus?.hasOriginal ? (
                  <img 
                    src={getMiniatureImagePath(mini.id, 'original')}
                    alt={mini.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <IconPhoto size={24} style={{ opacity: 0.5 }} />
                )}
              </div>
            </Table.Td>
            <Table.Td>
              <Stack gap={4}>
                <Text size="sm">{mini.name}</Text>
                <Group gap={4}>
                  {mini.types.map(type => (
                    <Badge 
                      key={type.id} 
                      size="xs" 
                      color={type.proxy_type ? 'blue' : 'teal'}
                      variant="dot"
                    >
                      {type.name}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Table.Td>
            <Table.Td>{mini.location}</Table.Td>
            <Table.Td>{mini.base_size_name || 'No Base'}</Table.Td>
            <Table.Td>{mini.painted_by_name || '-'}</Table.Td>
            <Table.Td>
              <Button 
                variant="subtle" 
                color="blue" 
                onClick={() => onEdit(mini)}
                size="xs"
                style={{ padding: '4px', minWidth: 0, width: '24px', height: '24px' }}
              >
                <IconEdit size={14} />
              </Button>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
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
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: 'var(--mantine-spacing-xs)'
    }}>
      {paginatedMinis.map(mini => (
        <Card 
          key={mini.id} 
          shadow="sm" 
          padding={0}
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
          <Card.Section style={{ position: 'relative' }}>
            <Button 
              variant="filled" 
              size="sm"
              color="dark"
              onClick={() => onEdit(mini)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 2,
                padding: '4px 8px',
                minWidth: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                transition: 'all 200ms ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <IconEdit size={16} />
            </Button>
            <div style={{ 
              width: '100%',
              aspectRatio: '1',
              backgroundColor: 'var(--mantine-color-dark-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {mini.imageStatus?.hasOriginal ? (
                <img 
                  src={getMiniatureImagePath(mini.id, 'original')}
                  alt={mini.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '8px'
                  }}
                />
              ) : (
                <IconPhoto size={48} style={{ opacity: 0.5 }} />
              )}
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
          <Stack gap="xs" p="sm">
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
  );
};

const BannerView = ({ minis, onEdit, currentPage, onPageChange }: { 
  minis: Mini[], 
  onEdit: (mini: Mini) => void,
  currentPage: number,
  onPageChange: (page: number) => void
}) => {
  // Generate random scale origins for each mini
  const scaleOrigins = useMemo(() => 
    minis.map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100
    }))
  , [minis]);

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
        {paginatedMinis.map((mini, index) => (
          <Card 
            key={mini.id} 
            shadow="sm" 
            padding="xs"
            withBorder
            style={{
              transition: 'all 200ms ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            component="div"
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'scale(1.02)';
              target.style.zIndex = '100';
              target.style.boxShadow = '0 0 20px 0 var(--mantine-color-primary-light)';
              const bgImage = target.querySelector('.background-image') as HTMLElement;
              if (bgImage) {
                bgImage.style.opacity = '0.15';
                bgImage.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'none';
              target.style.zIndex = '';
              target.style.boxShadow = 'var(--mantine-shadow-sm)';
              const bgImage = target.querySelector('.background-image') as HTMLElement;
              if (bgImage) {
                bgImage.style.opacity = '0';
                bgImage.style.transform = 'scale(0.95)';
              }
            }}
          >
            {/* Background blur effect */}
            {mini.imageStatus?.hasOriginal && (
              <div 
                className="background-image"
                style={{
                  position: 'absolute',
                  top: '-10%',
                  left: '-10%',
                  right: '-10%',
                  bottom: '-10%',
                  backgroundImage: `url(${getMiniatureImagePath(mini.id, 'original')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(10px)',
                  opacity: 0,
                  transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'scale(0.95)',
                  transformOrigin: `${scaleOrigins[index].x}% ${scaleOrigins[index].y}%`,
                  zIndex: 0
                }}
              />
            )}

            <Group wrap="nowrap" align="flex-start" gap="sm" style={{ position: 'relative', zIndex: 1 }}>
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
                position: 'relative',
                overflow: 'hidden'
              }}>
                {mini.imageStatus?.hasOriginal ? (
                  <img 
                    src={getMiniatureImagePath(mini.id, 'original')}
                    alt={mini.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <IconPhoto size={32} style={{ opacity: 0.5 }} />
                )}
                <Button 
                  variant="filled" 
                  size="sm"
                  color="dark"
                  onClick={() => onEdit(mini)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    padding: '4px 8px',
                    minWidth: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    transition: 'all 200ms ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <IconEdit size={16} />
                </Button>
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
              </div>
            </Group>
          </Card>
        ))}
      </div>
    </Stack>
  );
};

interface MiniatureModalProps {
  opened: boolean;
  onClose: () => void;
  miniature: Mini | null;
}

const MiniatureModal = ({ opened, onClose, miniature }: MiniatureModalProps) => {
  const queryClient = useQueryClient();
  const { colorScheme } = useMantineColorScheme();
  const [formData, setFormData] = useState<Mini | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<ImageStatus>({ hasOriginal: false, hasThumb: false });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Query for base sizes
  const { data: baseSizes, isLoading: isLoadingBaseSizes } = useQuery({
    queryKey: ['base_sizes'],
    queryFn: async () => {
      const response = await fetch('/api/base_sizes');
      if (!response.ok) {
        throw new Error('Failed to fetch base sizes');
      }
      return response.json();
    }
  });

  // Query for painted by options
  const { data: paintedByOptions, isLoading: isLoadingPaintedBy } = useQuery({
    queryKey: ['painted_by'],
    queryFn: async () => {
      const response = await fetch('/api/painted_by');
      if (!response.ok) {
        throw new Error('Failed to fetch painted by options');
      }
      return response.json();
    }
  });

  // Query for product sets
  const { data: productSets, isLoading: isLoadingProductSets } = useQuery({
    queryKey: ['product_sets'],
    queryFn: async () => {
      const response = await fetch('/api/productinfo/sets');
      if (!response.ok) {
        throw new Error('Failed to fetch product sets');
      }
      const sets = await response.json();
      return sets.map((set: ProductSet) => ({
        value: set.id.toString(),
        label: [set.company_name, set.product_line_name, set.name]
          .filter(Boolean)
          .join(' » ')
      }));
    }
  });

  // Add tags query
  const { data: existingTags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      return response.json();
    }
  });

  // Add tags mutation
  const updateTagsMutation = useMutation({
    mutationFn: async ({ miniId, tags }: { miniId: number, tags: Array<{ id: number, name: string }> }) => {
      const response = await fetch(`/api/minis/${miniId}/tags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags }),
      });
      if (!response.ok) {
        throw new Error('Failed to update tags');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miniatures'] });
    }
  });

  useEffect(() => {
    if (opened && miniature) {
      setFormData(miniature);
      // Check image status when modal opens
      checkMiniatureImageStatus(miniature.id).then(status => {
        console.log('Image status received:', status);
        setImageStatus(status);
      });
    } else {
      setFormData(null);
      setImageFile(null);
      setImagePreview(null);
      setImageStatus({ hasOriginal: false, hasThumb: false });
    }
  }, [opened, miniature]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData?.id) return;

    setIsUploadingImage(true);
    try {
      const success = await uploadMiniatureImage(formData.id, file);
      if (success) {
        const newStatus = await checkMiniatureImageStatus(formData.id);
        setImageStatus(newStatus);
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    if (!formData?.id) return;

    setIsDeletingImage(true);
    try {
      await deleteMiniatureImage(formData.id);
      setImageStatus({ hasOriginal: false, hasThumb: false });
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      // Update basic miniature data
      const response = await fetch(`/api/minis/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update miniature');
      }

      // Update tags if they've changed
      const currentTags = miniature?.tags || [];
      const newTags = formData.tags || [];
      
      if (JSON.stringify(currentTags) !== JSON.stringify(newTags)) {
        await updateTagsMutation.mutateAsync({
          miniId: formData.id,
          tags: newTags
        });
      }

      // Handle image upload if needed
      if (imageFile) {
        await uploadMiniatureImage(formData.id, imageFile);
      }

      queryClient.invalidateQueries({ queryKey: ['miniatures'] });
      onClose();
    } catch (error) {
      console.error('Error updating miniature:', error);
    }
  };

  return (
    <AdminModal
      opened={opened}
      onClose={onClose}
      title={miniature ? 'Edit Miniature' : 'Add Miniature'}
      size="70%"
    >
      <form onSubmit={handleSubmit}>
        <Grid>
          {/* Left Column - 30% width */}
          <Grid.Col span={4}>
            <Stack>
              {/* Image upload section */}
              <Box 
                style={{ 
                  aspectRatio: '1',
                  backgroundColor: 'var(--mantine-color-dark-4)',
                  borderRadius: 'var(--mantine-radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--mantine-color-dark-3)',
                  position: 'relative',
                  width: '100%',
                  overflow: 'hidden'
                }}
              >
                {imageStatus.hasOriginal ? (
                  <img 
                    src={formData?.id ? getMiniatureImagePath(formData.id, 'original') : ''}
                    alt={formData?.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <IconPhoto style={{ width: '40%', height: '40%', opacity: 0.5 }} />
                )}

                {/* Upload trigger button - show when no image */}
                {!imageStatus.hasOriginal && !isUploadingImage && (
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      opacity: 0.7
                    }}
                  >
                    Upload Image
                  </Button>
                )}

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png,image/webp"
                />

                {/* Delete button - show when image exists */}
                {imageStatus.hasOriginal && !isDeletingImage && (
                  <Button 
                    variant="light"
                    color="red"
                    size="xs"
                    onClick={() => {
                      modals.openConfirmModal({
                        title: 'Delete Image',
                        children: (
                          <Text size="sm">
                            Are you sure you want to delete this image? This action cannot be undone.
                          </Text>
                        ),
                        labels: { confirm: 'Delete', cancel: 'Cancel' },
                        confirmProps: { color: 'red' },
                        onConfirm: handleImageDelete
                      });
                    }}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease',
                      '&:hover': {
                        opacity: 1
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}

                {/* Loading states */}
                {(isUploadingImage || isDeletingImage) && (
                  <Box
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Loader color="white" size="sm" />
                  </Box>
                )}
              </Box>

              {/* Rest of the left column */}
              <Select
                label="Base Size"
                value={formData?.base_size_id?.toString()}
                onChange={(value) => setFormData(prev => prev ? { ...prev, base_size_id: parseInt(value || '3') } : null)}
                data={baseSizes?.map((option: BaseSize) => ({
                  value: option.id.toString(),
                  label: option.base_size_name.charAt(0).toUpperCase() + option.base_size_name.slice(1)
                })) || []}
                disabled={isLoadingBaseSizes}
              />
              <Select
                label="Painted By"
                value={formData?.painted_by_id?.toString()}
                onChange={(value) => setFormData(prev => prev ? { ...prev, painted_by_id: parseInt(value || '1') } : null)}
                data={paintedByOptions?.map((option: PaintedBy) => ({
                  value: option.id.toString(),
                  label: option.painted_by_name.charAt(0).toUpperCase() + option.painted_by_name.slice(1)
                })) || []}
                disabled={isLoadingPaintedBy}
              />
              <TextInput
                label="Location"
                value={formData?.location || ''}
                onChange={(e) => setFormData(prev => prev ? { ...prev, location: e.target.value } : null)}
                required
              />
            </Stack>
          </Grid.Col>

          {/* Right Column - 70% width */}
          <Grid.Col span={8}>
            <Stack>
              <TextInput
                label="Name"
                value={formData?.name || ''}
                onChange={(e) => setFormData(prev => prev ? { ...prev, name: e.target.value } : null)}
                required
              />
              <Select
                label="Product Set"
                placeholder="Select a product set"
                value={formData?.product_set_id?.toString()}
                onChange={(value) => setFormData(prev => prev ? { 
                  ...prev, 
                  product_set_id: value ? parseInt(value) : null,
                  product_set_name: null,
                  product_line_name: null,
                  company_name: null
                } : null)}
                data={productSets ?? []}
                disabled={isLoadingProductSets}
                searchable
                clearable
              />
              <NumberInput
                label="Quantity"
                value={formData?.quantity || 1}
                onChange={(value) => setFormData(prev => prev ? { ...prev, quantity: typeof value === 'number' ? value : 1 } : null)}
                min={0}
                required
              />
              <TagsInput
                label="Tags"
                description="Enter existing tags or create new ones"
                value={formData?.tags?.map(t => t.name) || []}
                onChange={(values) => {
                  setFormData(prev => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      tags: values.map(name => {
                        // Try to find existing tag
                        const existingTag = existingTags?.find(t => t.name === name);
                        return existingTag || { id: -1, name };
                      })
                    };
                  });
                }}
                data={existingTags?.map(t => t.name) || []}
                splitChars={[',', ' ', 'Enter']}
                maxTags={50}
                clearable
                style={{ flex: 1 }}
              />
              <Textarea
                label="Description"
                value={formData?.description || ''}
                onChange={(e) => setFormData(prev => prev ? { ...prev, description: e.target.value } : null)}
                minRows={3}
                placeholder="Enter miniature description..."
              />
            </Stack>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="xl">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button type="submit" color="blue">Save Changes</Button>
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
      const minis = await response.json();
      
      // Check image status for all minis
      const minisWithImageStatus = await Promise.all(
        minis.map(async (mini) => {
          const imageStatus = await checkMiniatureImageStatus(mini.id);
          return { ...mini, imageStatus };
        })
      );
      
      return minisWithImageStatus;
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
      <MiniatureModal
        opened={!!editingMini}
        onClose={() => setEditingMini(null)}
        miniature={editingMini}
      />

      {/* Add Modal */}
      <AdminModal
        opened={isAddingMini}
        onClose={() => setIsAddingMini(false)}
        title="Add Miniature"
        size="xl"
      >
        <Stack>
          {/* Add form content here */}
        </Stack>
      </AdminModal>
    </Stack>
  );
} 