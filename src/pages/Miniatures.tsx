import React, { useMemo, useRef, useEffect } from 'react';
import { useState } from 'react';
import { Stack, Title, Text, Group, Card, Button, TextInput, MultiSelect, Select, Textarea, NumberInput, useMantineColorScheme, Radio, TagsInput, Badge, Center, Loader, SegmentedControl, Pagination, Box, Grid, Paper, UnstyledButton, ActionIcon, Table, MantineTheme, Combobox, useCombobox, InputBase, ScrollArea, Notification, SimpleGrid } from '@mantine/core';
import { DataTable } from '../components/ui/table/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TableActions } from '../components/ui/tableactions/TableActions';
import { IconEdit, IconPlus, IconPhoto, IconTable, IconLayoutGrid, IconLayoutList, IconSearch, IconPackage, IconTrash, IconX, IconCheck } from '@tabler/icons-react';
import { AdminModal } from '../components/AdminModal';
import { getMiniatureImagePath, checkMiniatureImageStatus, uploadMiniatureImage, deleteMiniatureImage, ImageStatus } from '../utils/imageUtils';
import { modals } from '@mantine/modals';
import { getProductSets } from '../api/productinfo/sets/get';
import { badgeStyles, typeStyles } from '../utils/theme';

interface Category {
  id: number;
  name: string;
}

interface MiniType {
  id: number;
  name: string;
  proxy_type: boolean;
  categories?: number[];
  category_names?: string[];
  mini_ids?: number[];
  mini_count?: number;
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
  imageTimestamp?: number;
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

const TableView = ({ minis, onEdit, currentPage, onPageChange, imageTimestamp }: { 
  minis: Mini[], 
  onEdit: (mini: Mini) => void,
  currentPage: number,
  onPageChange: (page: number) => void,
  imageTimestamp: number
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
                    src={getMiniatureImagePath(
                      mini.id, 
                      'original', 
                      mini.imageTimestamp || imageTimestamp
                    )}
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

const CardsView = ({ minis, onEdit, currentPage, onPageChange, imageTimestamp }: { 
  minis: Mini[], 
  onEdit: (mini: Mini) => void,
  currentPage: number,
  onPageChange: (page: number) => void,
  imageTimestamp: number
}) => {
  const paginatedMinis = minis.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <SimpleGrid cols={5} spacing="sm">
      {paginatedMinis.map((mini) => (
        <Card 
          key={mini.id} 
          shadow="sm" 
          padding={0}
          withBorder
          style={{
            transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            border: '1px solid transparent'
          }}
          onClick={() => onEdit(mini)}
          onMouseEnter={(e) => {
            const target = e.currentTarget;
            target.style.transform = 'translateY(-4px) scale(1.02)';
            target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
            target.style.borderColor = 'var(--mantine-color-primary-light)';
            target.style.zIndex = '1';
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget;
            target.style.transform = 'none';
            target.style.boxShadow = 'var(--mantine-shadow-sm)';
            target.style.borderColor = 'transparent';
            target.style.zIndex = 'auto';
          }}
        >
          <Card.Section style={{ position: 'relative' }}>
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
                  src={getMiniatureImagePath(
                    mini.id, 
                    'original', 
                    mini.imageTimestamp || imageTimestamp
                  )}
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
                  items={mini.types?.filter(type => !type.proxy_type) || []} 
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

            {mini.types?.some(type => type.proxy_type) && (
              <PillsList 
                items={mini.types?.filter(type => type.proxy_type) || []} 
                color="blue"
              />
            )}

            {mini.category_names?.length > 0 && (
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
    </SimpleGrid>
  );
};

const BannerView = ({ minis, onEdit, currentPage, onPageChange, imageTimestamp }: { 
  minis: Mini[], 
  onEdit: (mini: Mini) => void,
  currentPage: number,
  onPageChange: (page: number) => void,
  imageTimestamp: number
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
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => onEdit(mini)}
            onMouseEnter={(e) => {
              const target = e.currentTarget;
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
              const target = e.currentTarget;
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
                  backgroundImage: `url(${getMiniatureImagePath(mini.id, 'original', mini.imageTimestamp || imageTimestamp)})`,
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
                    src={getMiniatureImagePath(mini.id, 'original', mini.imageTimestamp || imageTimestamp)}
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
                      .join(' » ')}
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
  onImageUpdate?: (timestamp: number) => void;
}

const MiniatureModal = ({ opened, onClose, miniature, onImageUpdate }: MiniatureModalProps) => {
  const queryClient = useQueryClient();
  const { colorScheme } = useMantineColorScheme();
  const [formData, setFormData] = useState<Mini | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<ImageStatus>({ hasOriginal: false, hasThumb: false });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    color: string;
  }>({ show: false, title: '', message: '', color: 'blue' });

  // Validate name field
  const validateName = (name: string): string | null => {
    const trimmedName = name.trim();
    if (!trimmedName) return 'Name is required';
    if (trimmedName.length < 2) return 'Name must be at least 2 characters';
    if (trimmedName.length > 100) return 'Name must be less than 100 characters';
    return null;
  };

  // Validate location field
  const validateLocation = (location: string): string | null => {
    const trimmedLocation = location.trim();
    if (!trimmedLocation) return 'Location is required';
    if (trimmedLocation.length > 100) return 'Location must be less than 100 characters';
    return null;
  };

  // Handle name change with validation
  const handleNameChange = (value: string) => {
    setFormData(prev => prev ? { ...prev, name: value } : null);
    if (nameError) {
      setNameError(validateName(value));
    }
  };

  // Handle location change with validation
  const handleLocationChange = (value: string) => {
    setFormData(prev => prev ? { ...prev, location: value } : null);
    if (locationError) {
      setLocationError(validateLocation(value));
    }
  };

  // Validate all form fields
  const validateForm = (): boolean => {
    if (!formData) return false;

    const nameValidationError = validateName(formData.name);
    const locationValidationError = validateLocation(formData.location);

    setNameError(nameValidationError);
    setLocationError(locationValidationError);

    return !nameValidationError && !locationValidationError;
  };

  // Validate before submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSubmitting(true);

    try {
      // First update basic miniature data
      const basicData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        description: formData.description,
        quantity: formData.quantity,
        painted_by_id: formData.painted_by_id,
        base_size_id: formData.base_size_id,
        product_set_id: formData.product_set_id
      };

      console.log('Updating basic data:', basicData);
      const response = await fetch(`/api/minis/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basicData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Basic data update failed:', errorText);
        throw new Error('Failed to update miniature');
      }

      const updatedBasicData = await response.json();
      console.log('Basic data updated:', updatedBasicData);

      // Update types
      const typeUpdateData = {
        types: formData.types.map(type => ({
          id: type.id,
          proxy_type: type.proxy_type ? 1 : 0
        }))
      };
      console.log('Updating types:', typeUpdateData);

      const typesResponse = await fetch(`/api/minis/${formData.id}/types`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(typeUpdateData),
      });

      if (!typesResponse.ok) {
        const errorText = await typesResponse.text();
        console.error('Types update failed:', errorText);
        throw new Error('Failed to update types');
      }

      const typesData = await typesResponse.json();
      console.log('Types data received:', typesData);
      const updatedTypes = JSON.parse(typesData.type_info || '[]').filter((t: any) => t.id !== null);
      console.log('Parsed types:', updatedTypes);

      // Update tags if they've changed
      const currentTags = miniature?.tags || [];
      const newTags = formData.tags || [];
      
      if (JSON.stringify(currentTags) !== JSON.stringify(newTags)) {
        console.log('Updating tags:', newTags);
        await updateTagsMutation.mutateAsync({
          miniId: formData.id,
          tags: newTags
        });
      }

      // Handle image upload if needed
      let newImageStatus = imageStatus;
      if (imageFile) {
        console.log('Uploading image');
        await uploadMiniatureImage(formData.id, imageFile);
        newImageStatus = { hasOriginal: true, hasThumb: true };
      }

      // Fetch the complete updated miniature to ensure we have all data
      const getMiniResponse = await fetch(`/api/miniatures`);
      if (!getMiniResponse.ok) {
        throw new Error('Failed to fetch updated miniature data');
      }
      const allMinis = await getMiniResponse.json();
      const completeUpdatedMini = {
        ...allMinis.find((mini: Mini) => mini.id === formData.id),
        imageStatus: newImageStatus
      };
      console.log('Complete updated mini:', completeUpdatedMini);

      // Update the cache with the new data
      queryClient.setQueryData(['minis'], (oldData: any) => {
        if (!oldData) return oldData;

        // If data is a direct array (which it should be based on the query)
        if (Array.isArray(oldData)) {
          console.log('Updating minis array in cache');
          return oldData.map((item: Mini) =>
            item.id === completeUpdatedMini.id ? {
              ...completeUpdatedMini,
              imageStatus: newImageStatus
            } : item
          );
        }

        return oldData;
      });

      onClose();
    } catch (error) {
      console.error('Error updating miniature:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove the effect that was invalidating on close since we're updating the cache directly
  useEffect(() => {
    if (opened) {
      setNameError(null);
      setLocationError(null);
      setIsSubmitting(false);
    }
  }, [opened]);

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

  // Query for all available types
  const { data: availableTypes } = useQuery({
    queryKey: ['miniature_types'],
    queryFn: async () => {
      const response = await fetch('/api/types');
      if (!response.ok) {
        throw new Error('Failed to fetch miniature types');
      }
      return response.json();
    }
  });

  // State for type search
  const [typeSearchValue, setTypeSearchValue] = useState('');
  
  // Combobox state
  const combobox = useCombobox({
    onDropdownClose: () => {
      setTypeSearchValue('');
    }
  });

  // Filter available types based on search
  const filteredTypes = useMemo(() => {
    if (!availableTypes || !typeSearchValue) return [];
    return availableTypes
      .filter((type: MiniType) => 
        type.name.toLowerCase().includes(typeSearchValue.toLowerCase()) &&
        !formData?.types?.some((t: MiniType) => t.id === type.id)
      )
      .sort((a: MiniType, b: MiniType) => a.name.localeCompare(b.name));
  }, [availableTypes, typeSearchValue, formData?.types]);

  // Handle adding a type
  const handleAddType = (typeToAdd: MiniType) => {
    setFormData(prev => {
      if (!prev) return null;
      
      // If it's the only type, set it as main
      const isOnlyType = !prev.types || prev.types.length === 0;
      
      const newType = {
        id: typeToAdd.id,
        name: typeToAdd.name,
        proxy_type: !isOnlyType // false if it's the only type, true otherwise
      };

      return {
        ...prev,
        types: [...(prev.types || []), newType]
      };
    });
    setTypeSearchValue(''); // Clear search after adding
  };

  // Handle removing a type
  const handleRemoveType = (typeId: number) => {
    setFormData(prev => {
      if (!prev) return null;
      
      const wasMain = prev.types.find(t => t.id === typeId)?.proxy_type === false;
      const remainingTypes = prev.types.filter(t => t.id !== typeId);
      
      // If we removed the main type and there are other types, set the first one as main
      if (wasMain && remainingTypes.length > 0) {
        remainingTypes[0].proxy_type = false;
        // Ensure all other types are proxy
        for (let i = 1; i < remainingTypes.length; i++) {
          remainingTypes[i].proxy_type = true;
        }
      }

      return {
        ...prev,
        types: remainingTypes
      };
    });
  };

  // Handle setting a type as main
  const handleSetMainType = (typeId: number) => {
    setFormData(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        types: prev.types.map(t => ({
          ...t,
          proxy_type: t.id !== typeId // true for all except the selected main type
        }))
      };
    });
  };

  // Query for categories of selected types
  const { data: typeCategories } = useQuery({
    queryKey: ['type_categories', formData?.types?.map(t => t.id)],
    queryFn: async () => {
      if (!formData?.types?.length) return [];
      
      // Get categories for each type
      const promises = formData.types.map(type => 
        fetch(`/api/classification/types/${type.id}/categories`)
          .then(res => res.json())
      );
      
      const allCategories = await Promise.all(promises);
      
      // Consolidate unique categories
      const uniqueCategories = new Map();
      allCategories.flat().forEach(cat => {
        uniqueCategories.set(cat.id, cat);
      });
      
      return Array.from(uniqueCategories.values());
    },
    enabled: !!formData?.types?.length
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

  // Add this effect for auto-hiding notifications
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Update the validateImageRatio function
  const validateImageRatio = async (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        if (Math.abs(aspectRatio - 1) > 0.02) {  // Allow only 2% deviation from square
          setNotification({
            show: true,
            title: 'Error',
            message: 'Only square images are allowed. Please crop your image to a 1:1 ratio.',
            color: 'red'
          });
          reject(new Error('Image must be square'));
        }
        resolve(true);
      };
      
      img.onerror = () => {
        setNotification({
          show: true,
          title: 'Error',
          message: 'Failed to load image',
          color: 'red'
        });
        reject(new Error('Failed to load image'));
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData?.id) return;

    // Store current state in case we need to revert
    const previousImageStatus = { ...imageStatus };
    const previousPreview = imagePreview;

    try {
      await validateImageRatio(file);
      // Set preview immediately after validation succeeds
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      setIsUploadingImage(true);
      const success = await uploadMiniatureImage(formData.id, file);
      if (success) {
        const newStatus = await checkMiniatureImageStatus(formData.id);
        setImageStatus(newStatus);
        const newTimestamp = Date.now();
        if (onImageUpdate) {
          onImageUpdate(newTimestamp);
        }
        
        // Update the cache with the new timestamp
        queryClient.setQueryData(['minis'], (oldData: any) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.map((mini: Mini) =>
            mini.id === formData.id
              ? { 
                  ...mini, 
                  imageStatus: newStatus,
                  imageTimestamp: newTimestamp 
                }
              : mini
          );
        });

        setNotification({
          show: true,
          title: 'Success',
          message: 'Image uploaded successfully',
          color: 'green'
        });
      } else {
        // Revert to previous state on upload failure
        setImagePreview(previousPreview);
        setImageStatus(previousImageStatus);
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      // Revert to previous state on any error
      setImagePreview(previousPreview);
      setImageStatus(previousImageStatus);
      if (error instanceof Error && error.message !== 'Image must be square') {
        setNotification({
          show: true,
          title: 'Error',
          message: 'Failed to upload image',
          color: 'red'
        });
      }
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add this before the handleImageDelete function
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = 'var(--mantine-color-dark-3)';
    e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-4)';
    
    const file = e.dataTransfer?.files[0];
    if (!file || !formData?.id) return;

    // Store current state in case we need to revert
    const previousImageStatus = { ...imageStatus };
    const previousPreview = imagePreview;

    try {
      await validateImageRatio(file);
      // Set preview immediately after validation succeeds
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      setIsUploadingImage(true);
      const success = await uploadMiniatureImage(formData.id, file);
      if (success) {
        const newStatus = await checkMiniatureImageStatus(formData.id);
        setImageStatus(newStatus);
        const newTimestamp = Date.now();
        if (onImageUpdate) {
          onImageUpdate(newTimestamp);
        }
        
        // Update the cache with the new timestamp
        queryClient.setQueryData(['minis'], (oldData: any) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.map((mini: Mini) =>
            mini.id === formData.id
              ? { 
                  ...mini, 
                  imageStatus: newStatus,
                  imageTimestamp: newTimestamp 
                }
              : mini
          );
        });

        setNotification({
          show: true,
          title: 'Success',
          message: 'Image uploaded successfully',
          color: 'green'
        });
      } else {
        // Revert to previous state on upload failure
        setImagePreview(previousPreview);
        setImageStatus(previousImageStatus);
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      // Revert to previous state on any error
      setImagePreview(previousPreview);
      setImageStatus(previousImageStatus);
      if (error instanceof Error && error.message !== 'Image must be square') {
        setNotification({
          show: true,
          title: 'Error',
          message: 'Failed to upload image',
          color: 'red'
        });
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = 'var(--mantine-color-blue-5)';
    e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-5)';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--mantine-color-dark-3)';
    e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-4)';
  };

  // Update the handleImageDelete function
  const handleImageDelete = async () => {
    if (!formData?.id) return;

    // Show confirmation modal
    modals.openConfirmModal({
      title: 'Delete Image',
      children: (
        <Text size="sm">
          Are you sure you want to delete this image? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setIsDeletingImage(true);
        try {
          await deleteMiniatureImage(formData.id);
          // Clear both preview and status
          setImagePreview(null);
          setImageStatus({ hasOriginal: false, hasThumb: false });
          
          // Update the cache to reflect the image deletion
          queryClient.setQueryData(['minis'], (oldData: any) => {
            if (!Array.isArray(oldData)) return oldData;
            return oldData.map((mini: Mini) =>
              mini.id === formData.id
                ? { ...mini, imageStatus: { hasOriginal: false, hasThumb: false } }
                : mini
            );
          });

          setNotification({
            show: true,
            title: 'Success',
            message: 'Image deleted successfully',
            color: 'green'
          });
        } catch (error) {
          setNotification({
            show: true,
            title: 'Error',
            message: 'Failed to delete image',
            color: 'red'
          });
        } finally {
          setIsDeletingImage(false);
        }
      }
    });
  };

  // Add an effect to refetch data when modal closes
  useEffect(() => {
    if (!opened) {
      queryClient.invalidateQueries({ queryKey: ['miniatures'] });
    }
  }, [opened, queryClient]);

  return (
    <AdminModal
      opened={opened}
      onClose={onClose}
      title={miniature ? `Edit Miniature: ${miniature.name}` : 'Add Miniature'}
      rightHeaderText={miniature ? `ID: ${miniature.id}` : ''}
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
                  border: '2px solid var(--mantine-color-dark-3)',
                  position: 'relative',
                  width: '100%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {(imageStatus.hasOriginal || imagePreview) ? (
                  <>
                    <Box
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative'
                      }}
                    >
                      <img 
                        src={imagePreview || (formData?.id ? getMiniatureImagePath(
                          formData.id, 
                          'original',
                          Date.now()
                        ) : '')}
                        alt={formData?.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          opacity: 0,
                          transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          transform: 'scale(0.8)'
                        }}
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          img.style.opacity = '1';
                          img.style.transform = 'scale(1)';
                        }}
                      />
                      <ActionIcon
                        variant="filled"
                        color="red"
                        size="sm"
                        style={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          zIndex: 2
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageDelete();
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Box>
                  </>
                ) : (
                  <Stack align="center" gap="xs">
                    <IconPhoto style={{ width: '40%', height: '40%', opacity: 0.5 }} />
                    <Box 
                      style={{ 
                        border: '2px dashed var(--mantine-color-dark-2)',
                        borderRadius: 'var(--mantine-radius-sm)',
                        padding: '8px 16px'
                      }}
                    >
                      <Text size="sm" c="dimmed">Drop image here or click to upload</Text>
                    </Box>
                  </Stack>
                )}

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  accept="image/*"
                />

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

              {/* Base Size and Painted By row */}
              <Group grow>
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
              </Group>

              {/* Location and Quantity row */}
              <Group>
                <TextInput
                  label="Location"
                  value={formData?.location || ''}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  error={locationError}
                  required
                  placeholder="Enter storage location"
                  style={{ flex: 1 }}
                />
                <NumberInput
                  label="Quantity"
                  value={formData?.quantity || 1}
                  onChange={(value) => setFormData(prev => prev ? { ...prev, quantity: typeof value === 'number' ? value : 1 } : null)}
                  min={0}
                  max={99}
                  required
                  style={{ width: 70 }}
                  clampBehavior="strict"
                />
              </Group>
            </Stack>
          </Grid.Col>

          {/* Right Column - 70% width */}
          <Grid.Col span={8}>
            <Stack>
              {/* Name and Product Set row */}
              <Group grow>
                <TextInput
                  size="sm"
                  label="Name"
                  value={formData?.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  error={nameError}
                  required
                  placeholder="Enter miniature name"
                  data-autofocus
                />
                <Select
                  size="sm"
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
              </Group>

              {/* Tags */}
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
                        const existingTag = existingTags?.find((t: Tag) => t.name === name);
                        return existingTag || { id: -1, name };
                      })
                    };
                  });
                }}
                data={existingTags?.map((t: Tag) => t.name) || []}
                splitChars={[',', ' ', 'Enter']}
                maxTags={50}
                clearable
              />

              {/* Description */}
              <Textarea
                label="Description"
                value={formData?.description || ''}
                onChange={(e) => setFormData(prev => prev ? { ...prev, description: e.target.value } : null)}
                minRows={6}
                maxRows={6}
                autosize={false}
                placeholder="Enter miniature description..."
              />

              {/* Types Section */}
              <Box 
                p="sm"
                style={{ 
                  border: '1px solid var(--mantine-color-default-border)',
                  borderRadius: 'var(--mantine-radius-sm)',
                  backgroundColor: 'var(--mantine-color-body)'
                }}
              >
                <Stack gap="xs">
                  <Text fw={500}>Miniature Type</Text>
                  
                  {/* Type Search */}
                  <Combobox
                    store={combobox}
                    onOptionSubmit={(val) => {
                      const selectedType = availableTypes?.find(t => t.id.toString() === val);
                      if (selectedType) {
                        handleAddType(selectedType);
                        combobox.closeDropdown();
                      }
                    }}
                  >
                    <Combobox.Target>
                      <InputBase
                        placeholder="Search for types..."
                        value={typeSearchValue}
                        onChange={(event) => {
                          setTypeSearchValue(event.currentTarget.value);
                          combobox.openDropdown();
                        }}
                        onClick={() => combobox.openDropdown()}
                        rightSection={<Combobox.Chevron />}
                      />
                    </Combobox.Target>

                    <Combobox.Dropdown hidden={filteredTypes.length === 0}>
                      <ScrollArea.Autosize mah={400} type="scroll">
                        <Combobox.Options>
                          {filteredTypes.map((type: MiniType) => (
                            <Combobox.Option
                              key={type.id}
                              value={type.id.toString()}
                              style={{
                                color: 'var(--mantine-color-primary-text)',
                                '&[dataSelected]': {
                                  backgroundColor: 'var(--mantine-color-primary-light)',
                                  color: 'var(--mantine-color-primary-text)'
                                }
                              }}
                            >
                              {type.name}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      </ScrollArea.Autosize>
                    </Combobox.Dropdown>
                  </Combobox>

                  {/* Selected Types Table */}
                  {formData?.types && formData.types.length > 0 ? (
                    <>
                      <Box 
                        style={{ 
                          border: '1px solid var(--mantine-color-default-border)',
                          borderRadius: 'var(--mantine-radius-sm)',
                          overflow: 'hidden'
                        }}
                      >
                        <Table 
                          highlightOnHover 
                          withColumnBorders={false}
                          withTableBorder={false}
                          horizontalSpacing="sm"
                        >
                          <Table.Thead
                            style={{
                              backgroundColor: 'var(--mantine-color-primary-light)',
                              borderBottom: '1px solid var(--mantine-color-default-border)'
                            }}
                          >
                            <Table.Tr>
                              <Table.Th style={{ color: 'var(--mantine-color-primary-text)' }}>Type</Table.Th>
                              <Table.Th style={{ width: 70, textAlign: 'center', color: 'var(--mantine-color-primary-text)' }}>Main</Table.Th>
                              <Table.Th style={{ width: 70, textAlign: 'center', color: 'var(--mantine-color-primary-text)' }}>Actions</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {formData.types.map((type, index) => (
                              <Table.Tr 
                                key={type.id}
                                onClick={() => handleSetMainType(type.id)}
                                style={{ 
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: 'var(--mantine-color-default-hover)'
                                  }
                                }}
                              >
                                <Table.Td
                                  style={{
                                    borderBottom: index === formData.types.length - 1 ? 'none' : '1px solid var(--mantine-color-default-border)'
                                  }}
                                >
                                  <Stack gap={2}>
                                    <Text c="primary">{type.name}</Text>
                                    {type.category_names && type.category_names.length > 0 && (
                                      <Group gap={0} wrap="wrap">
                                        {type.category_names.map((category, idx) => (
                                          <Badge 
                                            key={idx} 
                                            size="xs" 
                                            variant="light"
                                            color="primary"
                                          >
                                            {category}
                                          </Badge>
                                        ))}
                                      </Group>
                                    )}
                                  </Stack>
                                </Table.Td>
                                <Table.Td 
                                  style={{ 
                                    textAlign: 'center',
                                    borderBottom: index === formData.types.length - 1 ? 'none' : '1px solid var(--mantine-color-default-border)'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ActionIcon
                                    variant={!type.proxy_type ? typeStyles.main.variant : typeStyles.proxy.variant}
                                    color={!type.proxy_type ? typeStyles.main.color : typeStyles.proxy.color}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetMainType(type.id);
                                    }}
                                    size="sm"
                                    aria-label="Set as main type"
                                    style={{
                                      opacity: !type.proxy_type ? typeStyles.main.opacity : typeStyles.proxy.opacity
                                    }}
                                  >
                                    <IconCheck 
                                      size={16}
                                      style={{ 
                                        opacity: !type.proxy_type ? 1 : 0.5 
                                      }} 
                                    />
                                  </ActionIcon>
                                </Table.Td>
                                <Table.Td 
                                  style={{ 
                                    textAlign: 'center',
                                    borderBottom: index === formData.types.length - 1 ? 'none' : '1px solid var(--mantine-color-default-border)'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ActionIcon
                                    color="red"
                                    variant="subtle"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveType(type.id);
                                    }}
                                    size="sm"
                                  >
                                    <IconX size={16} />
                                  </ActionIcon>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Box>

                      {/* Categories Section */}
                      {typeCategories && typeCategories.length > 0 && (
                        <Group gap="xs" mt="2">
                          {typeCategories
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(category => (
                              <Badge
                                key={category.id}
                                size="sm"
                                variant={badgeStyles.category.variant}
                                color={badgeStyles.category.color}
                              >
                                {category.name}
                              </Badge>
                            ))}
                        </Group>
                      )}
                    </>
                  ) : (
                    <Text c="dimmed" ta="center" py="xs" size="sm">Select a miniature type for this mini</Text>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="xl">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            color="green" 
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </Group>
      </form>

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
  const [imageTimestamp, setImageTimestamp] = useState<number>(Date.now());
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
      onPageChange: handlePageChange,
      imageTimestamp
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
        onImageUpdate={setImageTimestamp}
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