import React, { useMemo, useRef, useEffect } from 'react';
import { useState } from 'react';
import { Stack, Title, Text, Group, Card, Button, TextInput, Select, Textarea, NumberInput, useMantineColorScheme, TagsInput, Badge, Center, Loader, SegmentedControl, Pagination, Box, Grid, ActionIcon, Table, Combobox, useCombobox, InputBase, ScrollArea, Notification, SimpleGrid, List, useMantineTheme } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconPlus, IconPhoto, IconTable, IconLayoutGrid, IconLayoutList, IconSearch, IconTrash, IconX, IconCheck, IconClock, IconUpload } from '@tabler/icons-react';
import { AdminModal } from '../components/AdminModal';
import { getMiniatureImagePath, checkMiniatureImageStatus, ImageStatus } from '../utils/imageUtils';
import { modals } from '@mantine/modals';
import { badgeStyles, typeStyles } from '../utils/theme';
import { updateSettings } from '../api/settings/update';
import { getSettings } from '../api/settings/get';
import debounce from 'lodash/debounce';
import { notifications } from '@mantine/notifications';
import { DataTable } from '../components/ui/table/DataTable';


interface MiniType {
  id: number;
  name: string;
  proxy_type: boolean;
  categories?: number[];
  category_names?: string[];
  mini_ids?: number[];
  mini_count?: number;
}


interface Mini {
  purchased_at: any;
  started_at: any;
  completed_at: any;
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
    category_names: boolean;
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


type ViewType = 'table' | 'cards' | 'banner' | 'timeline';

const ITEMS_PER_PAGE = 10;

const TableView = ({ minis, onEdit, currentPage, onPageChange, imageTimestamp }: { 
  minis: Mini[], 
  onEdit: (mini: Mini) => void,
  currentPage: number,
  onPageChange: (page: number) => void,
  imageTimestamp: number
}) => {
  const theme = useMantineTheme();

  const columns = [
    { key: 'image', label: '', filterable: false },
    { key: 'name', label: 'Name', filterable: true },
    { key: 'types', label: 'Types / Categories', filterable: true },
    { key: 'details', label: 'Details', filterable: true }
  ];

  const renderRow = (mini: Mini) => (
    <Table.Tr 
      key={mini.id} 
      onClick={() => onEdit(mini)}
      style={{ 
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: theme.colors.dark[6]
        }
      }}
    >
      {/* Image Column */}
      <Table.Td>
        <div style={{ 
          width: '50px',
          height: '50px',
          backgroundColor: theme.colors.dark[4],
          borderRadius: theme.radius.sm,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
            <IconPhoto size={20} style={{ opacity: 0.5 }} />
          )}
        </div>
      </Table.Td>

      {/* Name Column */}
      <Table.Td>
        <Group justify="space-between" wrap="nowrap">
          <Text fw={500} size="sm" style={{ flex: 1 }}>{mini.name}</Text>
          {mini.quantity > 1 && (
            <Badge size="sm" variant="light" color="blue">×{mini.quantity}</Badge>
          )}
        </Group>
      </Table.Td>

      {/* Types / Categories Column */}
      <Table.Td>
        <Stack gap={4}>
          {/* Types Row */}
          <Group gap={4}>
            {mini.types
              .filter(type => !type.proxy_type)
              .map((type, index) => (
                <Badge 
                  key={type.id} 
                  size="sm"
                  variant={index === 0 ? "filled" : "light"}
                  color="teal"
                >
                  {type.name}
                </Badge>
              ))}
            {mini.types
              .filter(type => type.proxy_type)
              .map(type => (
                <Badge 
                  key={type.id} 
                  size="xs"
                  variant="light"
                  color="gray"
                >
                  {type.name}
                </Badge>
              ))}
          </Group>

          {/* Categories Row */}
          <Group gap={4}>
            {mini.category_names?.map((category, index) => (
              <Badge
                key={index}
                size="xs"
                variant="light"
                color="grape"
              >
                {category}
              </Badge>
            ))}
          </Group>
        </Stack>
      </Table.Td>

      {/* Details Column */}
      <Table.Td>
        <Stack gap={4}>
          {/* Base Size & Painted By Row */}
          <Group gap={4}>
            <Badge size="sm" variant="light" color="cyan">
              {mini.base_size_name ? capitalizeFirst(mini.base_size_name) : 'No Base'}
            </Badge>
            <Badge size="sm" variant="light" color="violet">
              {mini.painted_by_name?.toLowerCase() === 'prepainted' ? 'Prepainted' :
               mini.painted_by_name?.toLowerCase() === 'self' ? 'Selfpainted' :
               mini.painted_by_name ? `Painted by other` : 'Not painted'}
            </Badge>
          </Group>

          {/* Tags Row */}
          <Group gap={4}>
            {mini.tags && mini.tags.length > 0 ? (
              mini.tags.map(tag => (
                <Badge 
                  key={tag.id} 
                  size="xs" 
                  variant="light"
                  color="blue"
                >
                  {tag.name.replace(/^[^:]+:\s*/, '')}
                </Badge>
              ))
            ) : (
              <Text size="xs" c="dimmed" fs="italic">No tags</Text>
            )}
          </Group>
        </Stack>
      </Table.Td>
    </Table.Tr>
  );

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <DataTable
      data={minis}
      columns={columns}
      rowComponent={renderRow}
      withPagination={true}
      withFiltering={false}
      pageSize={ITEMS_PER_PAGE}
      currentPage={currentPage}
      onPageChange={onPageChange}
      filterInputProps={{
        rightSection: undefined,
        rightSectionWidth: undefined
      }}
    />
  );
};

const CardsView = ({ minis, onEdit, imageTimestamp }: { 
  minis: Mini[], 
  onEdit: (mini: Mini) => void,
  currentPage: number,
  onPageChange: (page: number) => void,
  imageTimestamp: number
}) => {
  return (
    <SimpleGrid cols={5} spacing="sm">
      {minis.map((mini) => (
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

const BannerView = ({ minis, onEdit, imageTimestamp }: { 
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

  return (
    <Stack>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--mantine-spacing-xs)'
      }}>
        {minis.map((mini, index) => (
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


const TimelineView = ({ minis, onEdit, currentPage, onPageChange, imageTimestamp }: {
  minis: Mini[],
  onEdit: (mini: Mini) => void,
  currentPage: number,
  onPageChange: (page: number) => void,
  imageTimestamp: number
}) => {
  useMantineColorScheme();

  // Generate random scale origins for each mini
  const scaleOrigins = useMemo(() => 
    minis.map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100
    }))
  , [minis]);

  // Sort minis by created_at in descending order (most recent first)
  const sortedMinis = useMemo(() => {
    return [...minis].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [minis]);

  // Group minis by time period
  const groupedMinis = useMemo(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    return {
      last24h: sortedMinis.filter(mini => new Date(mini.created_at) >= last24h),
      thisMonth: sortedMinis.filter(mini => {
        const createdAt = new Date(mini.created_at);
        return createdAt < last24h && createdAt >= lastMonth;
      }),
      older: sortedMinis.filter(mini => new Date(mini.created_at) < lastMonth)
    };
  }, [sortedMinis]);

  // Paginate the grouped minis

  return (
    <Stack>
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--mantine-spacing-md)'
      }}>
        {/* Last 24 Hours Section */}
        {groupedMinis.last24h.length > 0 && (
          <>
            <Text size="lg" fw={500} mt="md">Last 24 Hours</Text>
            {groupedMinis.last24h.map((mini, index) => (
              <Card
                key={mini.id}
                shadow="sm"
                padding="lg"
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
                
                <Group wrap="nowrap" align="flex-start" gap="xl" style={{ position: 'relative', zIndex: 1 }}>
                  {/* Image Section */}
                  <div style={{ 
                    width: '180px',
                    height: '180px',
                    backgroundColor: 'var(--mantine-color-dark-4)',
                    borderRadius: 'var(--mantine-radius-md)',
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

                  {/* Content Section */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Stack gap="xs">
                      {/* Title and Product Info */}
                      <div>
                        <Text fw={500} size="xl" style={{ lineHeight: 1.2, marginBottom: 4 }}>{mini.name}</Text>
                        <Text size="sm" style={{ fontStyle: 'italic' }} lineClamp={2}>
                          {[mini.company_name, mini.product_line_name, mini.product_set_name]
                            .filter(Boolean)
                            .join(' » ')}
                        </Text>
                      </div>

                      {/* Additional Info */}
                      <Group gap="xs">
                        <Text size="sm" c="dimmed" style={{ 
                          padding: '4px 8px',
                          border: '1px solid var(--mantine-color-dark-4)',
                          borderRadius: 'var(--mantine-radius-sm)',
                          backgroundColor: 'var(--mantine-color-dark-7)',
                          whiteSpace: 'nowrap'
                        }}>
                          {mini.base_size_name 
                            ? mini.base_size_name.charAt(0).toUpperCase() + mini.base_size_name.slice(1).toLowerCase() 
                            : 'No Base'}
                        </Text>
                        <Text size="sm" c="dimmed" style={{ 
                          padding: '4px 8px',
                          border: '1px solid var(--mantine-color-dark-4)',
                          borderRadius: 'var(--mantine-radius-sm)',
                          backgroundColor: 'var(--mantine-color-dark-6)',
                          whiteSpace: 'nowrap'
                        }}>
                          {mini.location}
                        </Text>
                        {mini.painted_by_name && (
                          <Text size="sm" c="dimmed" style={{ 
                            padding: '4px 8px',
                            border: '1px solid var(--mantine-color-dark-4)',
                            borderRadius: 'var(--mantine-radius-sm)',
                            backgroundColor: 'var(--mantine-color-dark-5)',
                            whiteSpace: 'nowrap'
                          }}>
                            {mini.painted_by_name}
                          </Text>
                        )}
                      </Group>

                      {/* Timeline-specific info */}
                      <Stack gap="xs">
                        {mini.purchased_at && (
                          <Group gap="xs">
                            <Text size="sm" fw={500}>Purchased:</Text>
                            <Text size="sm">{new Date(mini.purchased_at).toLocaleDateString()}</Text>
                          </Group>
                        )}
                        {mini.started_at && (
                          <Group gap="xs">
                            <Text size="sm" fw={500}>Started:</Text>
                            <Text size="sm">{new Date(mini.started_at).toLocaleDateString()}</Text>
                          </Group>
                        )}
                        {mini.completed_at && (
                          <Group gap="xs">
                            <Text size="sm" fw={500}>Completed:</Text>
                            <Text size="sm">{new Date(mini.completed_at).toLocaleDateString()}</Text>
                          </Group>
                        )}
                      </Stack>
                    </Stack>
                  </div>
                </Group>
              </Card>
            ))}
          </>
        )}

        {/* This Month Section */}
        {groupedMinis.thisMonth.length > 0 && (
          <>
            <Text size="lg" fw={500} mt="md">This Month</Text>
            {groupedMinis.thisMonth.map((mini, index) => (
              <Card
                key={mini.id}
                shadow="sm"
                padding="lg"
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
                
                <Group wrap="nowrap" align="flex-start" gap="xl" style={{ position: 'relative', zIndex: 1 }}>
                  {/* Image Section */}
                  <div style={{ 
                    width: '180px',
                    height: '180px',
                    backgroundColor: 'var(--mantine-color-dark-4)',
                    borderRadius: 'var(--mantine-radius-md)',
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

                  {/* Content Section */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Stack gap="xs">
                      {/* Title and Product Info */}
                      <div>
                        <Text fw={500} size="xl" style={{ lineHeight: 1.2, marginBottom: 4 }}>{mini.name}</Text>
                        <Text size="sm" style={{ fontStyle: 'italic' }} lineClamp={2}>
                          {[mini.company_name, mini.product_line_name, mini.product_set_name]
                            .filter(Boolean)
                            .join(' » ')}
                        </Text>
                      </div>

                      {/* Additional Info */}
                      <Group gap="xs">
                        <Text size="sm" c="dimmed" style={{ 
                          padding: '4px 8px',
                          border: '1px solid var(--mantine-color-dark-4)',
                          borderRadius: 'var(--mantine-radius-sm)',
                          backgroundColor: 'var(--mantine-color-dark-7)',
                          whiteSpace: 'nowrap'
                        }}>
                          {mini.base_size_name 
                            ? mini.base_size_name.charAt(0).toUpperCase() + mini.base_size_name.slice(1).toLowerCase() 
                            : 'No Base'}
                        </Text>
                        <Text size="sm" c="dimmed" style={{ 
                          padding: '4px 8px',
                          border: '1px solid var(--mantine-color-dark-4)',
                          borderRadius: 'var(--mantine-radius-sm)',
                          backgroundColor: 'var(--mantine-color-dark-6)',
                          whiteSpace: 'nowrap'
                        }}>
                          {mini.location}
                        </Text>
                        {mini.painted_by_name && (
                          <Text size="sm" c="dimmed" style={{ 
                            padding: '4px 8px',
                            border: '1px solid var(--mantine-color-dark-4)',
                            borderRadius: 'var(--mantine-radius-sm)',
                            backgroundColor: 'var(--mantine-color-dark-5)',
                            whiteSpace: 'nowrap'
                          }}>
                            {mini.painted_by_name}
                          </Text>
                        )}
                      </Group>

                      {/* Timeline-specific info */}
                      <Stack gap="xs">
                        {mini.purchased_at && (
                          <Group gap="xs">
                            <Text size="sm" fw={500}>Purchased:</Text>
                            <Text size="sm">{new Date(mini.purchased_at).toLocaleDateString()}</Text>
                          </Group>
                        )}
                        {mini.started_at && (
                          <Group gap="xs">
                            <Text size="sm" fw={500}>Started:</Text>
                            <Text size="sm">{new Date(mini.started_at).toLocaleDateString()}</Text>
                          </Group>
                        )}
                        {mini.completed_at && (
                          <Group gap="xs">
                            <Text size="sm" fw={500}>Completed:</Text>
                            <Text size="sm">{new Date(mini.completed_at).toLocaleDateString()}</Text>
                          </Group>
                        )}
                      </Stack>
                    </Stack>
                  </div>
                </Group>
              </Card>
            ))}
          </>
        )}

        {/* Older Section */}
        {groupedMinis.older.length > 0 && (
          <>
            <Text size="lg" fw={500} mt="md">Older</Text>
            {groupedMinis.older.map((mini, index) => (
              <Card
                key={mini.id}
                shadow="sm"
                padding="lg"
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
                
                <Group wrap="nowrap" align="flex-start" gap="xl" style={{ position: 'relative', zIndex: 1 }}>
                  {/* Image Section */}
                  <div style={{ 
                    width: '180px',
                    height: '180px',
                    backgroundColor: 'var(--mantine-color-dark-4)',
                    borderRadius: 'var(--mantine-radius-md)',
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

                  {/* Content Section */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Stack gap="xs">
                      {/* Title and Product Info */}
                      <div>
                        <Text fw={500} size="xl" style={{ lineHeight: 1.2, marginBottom: 4 }}>{mini.name}</Text>
                        <Text size="sm" style={{ fontStyle: 'italic' }} lineClamp={2}>
                          {[mini.company_name, mini.product_line_name, mini.product_set_name]
                            .filter(Boolean)
                            .join(' » ')}
                        </Text>
                      </div>

                      {/* Additional Info */}
                      <Group gap="xs">
                        <Text size="sm" c="dimmed" style={{ 
                          padding: '4px 8px',
                          border: '1px solid var(--mantine-color-dark-4)',
                          borderRadius: 'var(--mantine-radius-sm)',
                          backgroundColor: 'var(--mantine-color-dark-7)',
                          whiteSpace: 'nowrap'
                        }}>
                          {mini.base_size_name 
                            ? mini.base_size_name.charAt(0).toUpperCase() + mini.base_size_name.slice(1).toLowerCase() 
                            : 'No Base'}
                        </Text>
                        <Text size="sm" c="dimmed" style={{ 
                          padding: '4px 8px',
                          border: '1px solid var(--mantine-color-dark-4)',
                          borderRadius: 'var(--mantine-radius-sm)',
                          backgroundColor: 'var(--mantine-color-dark-6)',
                          whiteSpace: 'nowrap'
                        }}>
                          {mini.location}
                        </Text>
                        {mini.painted_by_name && (
                          <Text size="sm" c="dimmed" style={{ 
                            padding: '4px 8px',
                            border: '1px solid var(--mantine-color-dark-4)',
                            borderRadius: 'var(--mantine-radius-sm)',
                            backgroundColor: 'var(--mantine-color-dark-5)',
                            whiteSpace: 'nowrap'
                          }}>
                            {mini.painted_by_name}
                          </Text>
                        )}
                      </Group>

                      {/* Timeline-specific info */}
                      <Stack gap="xs">
                        {mini.purchased_at && (
                          <Group gap="xs">
                            <Text size="sm" fw={500}>Purchased:</Text>
                            <Text size="sm">{new Date(mini.purchased_at).toLocaleDateString()}</Text>
                          </Group>
                        )}
                        {mini.started_at && (
                          <Group gap="xs">
                            <Text size="sm" fw={500}>Started:</Text>
                            <Text size="sm">{new Date(mini.started_at).toLocaleDateString()}</Text>
                          </Group>
                        )}
                        {mini.completed_at && (
                          <Group gap="xs">
                            <Text size="sm" fw={500}>Completed:</Text>
                            <Text size="sm">{new Date(mini.completed_at).toLocaleDateString()}</Text>
                          </Group>
                        )}
                      </Stack>
                    </Stack>
                  </div>
                </Group>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      <Pagination 
        total={Math.ceil(minis.length / ITEMS_PER_PAGE)} 
        value={currentPage}
        onChange={onPageChange}
        mt="xl"
      />
    </Stack>
  );
};

interface MiniatureModalProps {
  opened: boolean;
  onClose: () => void;
  miniature: Mini | null;
  onImageUpdate?: (timestamp: number) => void;
}

const MiniatureModal = ({ opened, onClose, miniature }: MiniatureModalProps) => {
  const queryClient = useQueryClient();
  useMantineColorScheme();
  const [formData, setFormData] = useState<Mini | null>(null);
  const [] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [] = useState<ImageStatus>({ hasOriginal: false, hasThumb: false });
  const [] = useState(false);
  const [] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    color: string;
  }>({ show: false, title: '', message: '', color: 'blue' });
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [] = useState(Date.now());
  const [pendingImageUpload, setPendingImageUpload] = useState<File | null>(null);
  // Add state for animation
  const [showImage, setShowImage] = useState(false);

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

  // Initialize formData for adding a new miniature
  useEffect(() => {
    if (opened) {
      if (miniature) {
        setFormData(miniature);
        setImagePreview(null); // Clear any previous preview
      } else {
        const now = new Date().toISOString();
        setFormData({
          id: 0,
          name: '',
          description: '',
          location: '',
          quantity: 1,
          painted_by_id: 1,
          base_size_id: 3,
          product_set_id: null,
          types: [],
          tags: [],
          categories: [],
          category_names: [],
          base_size_name: null,
          painted_by_name: null,
          product_set_name: null,
          product_line_name: null,
          company_name: null,
          imageStatus: { hasOriginal: false, hasThumb: false },
          imageTimestamp: Date.now(),
          purchased_at: null,
          started_at: null,
          completed_at: null,
          created_at: now,
          updated_at: now
        });
        setImagePreview(null); // Clear any previous preview
      }
      setPendingImageUpload(null); // Clear any pending upload
      setNameError(null);
      setLocationError(null);
      setIsSubmitting(false);
    }
  }, [opened, miniature]);

  // Validate before submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (miniature) {
        // Existing code for updating a miniature
        const basicData = {
          name: formData.name.trim(),
          location: formData.location.trim(),
          description: formData.description,
          quantity: formData.quantity,
          painted_by_id: formData.painted_by_id,
          base_size_id: formData.base_size_id,
          product_set_id: formData.product_set_id
        };

        // Update basic data
        const response = await fetch(`/api/minis/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(basicData),
        });

        if (!response.ok) {
          throw new Error('Failed to update miniature');
        }

        // Update types
        await fetch(`/api/minis/${formData.id}/types`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            types: formData.types.map(type => ({
              id: type.id,
              proxy_type: type.proxy_type
            }))
          }),
        });

        // Update tags
        await fetch(`/api/minis/${formData.id}/tags`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tags: formData.tags
          }),
        });
        
        // After successful updates, update the cache directly
        queryClient.setQueryData(['minis'], (oldData: Mini[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(mini => 
            mini.id === formData.id 
              ? {
                  ...mini,
                  ...basicData,
                  types: formData.types,
                  tags: formData.tags,
                  updated_at: new Date().toISOString()
                }
              : mini
          );
        });

        // Optional: Invalidate in background for eventual consistency
        queryClient.invalidateQueries({ 
          queryKey: ['minis'],
          exact: true,
          refetchType: 'none' // Prevent immediate refetch
        });

        setNotification({
          show: true,
          title: 'Success',
          message: 'Miniature updated successfully',
          color: 'green'
        });

        // Close the modal
        onClose();
      } else {
        // Logic for adding a new miniature
        const newMiniatureData = {
          name: formData.name.trim(),
          location: formData.location.trim(),
          description: formData.description,
          quantity: formData.quantity,
          painted_by_id: formData.painted_by_id,
          base_size_id: formData.base_size_id,
          product_set_id: formData.product_set_id,
          types: formData.types.map(type => ({
            id: type.id,
            proxy_type: type.proxy_type
          })),
          tags: formData.tags
        };

        console.log('Sending new miniature data:', {
          url: '/api/miniatures',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: newMiniatureData
        });

        const response = await fetch('/api/miniatures', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(newMiniatureData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to add new miniature:', errorText);
          console.error('Response status:', response.status);
          console.error('Response headers:', Object.fromEntries(response.headers.entries()));
          
          // Handle unauthorized error specifically
          if (response.status === 401) {
            setNotification({
              show: true,
              title: 'Error',
              message: 'You need to be logged in to add miniatures',
              color: 'red'
            });
            // Optionally redirect to login page or trigger login modal
            return;
          }
          
          throw new Error('Failed to add new miniature');
        }

        const addedMiniature = await response.json();

        // If we have a pending image upload, handle it now
        if (pendingImageUpload) {
          const formData = new FormData();
          formData.append('image', pendingImageUpload);

          const imageResponse = await fetch(`/api/minis/${addedMiniature.id}/image`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          if (!imageResponse.ok) {
            console.error('Failed to upload image:', await imageResponse.text());
            setNotification({
              show: true,
              title: 'Warning',
              message: 'Miniature was created but image upload failed',
              color: 'yellow'
            });
          }
        }

        // Update the cache with the new miniature
        queryClient.invalidateQueries({ queryKey: ['minis'] });

        // Clear the pending image upload
        setPendingImageUpload(null);
        setImagePreview(null);
        
        setNotification({
          show: true,
          title: 'Success',
          message: 'Miniature added successfully',
          color: 'green'
        });
        
        onClose();
      }
    } catch (error) {
      console.error('Error handling miniature:', error);
      setNotification({
        show: true,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save miniature',
        color: 'red'
      });
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

  // Fix the filtered types logic
  const filteredTypes = useMemo(() => {
    if (!availableTypes || !typeSearchValue) return [];
    return availableTypes
      .filter((type: MiniType) => 
        type.name.toLowerCase().includes(typeSearchValue.toLowerCase()) &&
        !formData?.types?.some((t: { id: number }) => t.id === type.id)
      )
      .sort((a: MiniType, b: MiniType) => a.name.localeCompare(b.name));
  }, [availableTypes, typeSearchValue, formData?.types]);

  // Handle adding a type
  const handleAddType = (typeToAdd: MiniType) => {
    setFormData(prev => {
      if (!prev) return null;
      
      const newType = {
        id: typeToAdd.id,
        name: typeToAdd.name,
        proxy_type: prev.types.length > 0, // false if it's the first type
        category_names: false // Set as boolean instead of array
      };

      return {
        ...prev,
        types: [...prev.types, newType]
      };
    });
    setTypeSearchValue('');
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


  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setNotification({
        show: true,
        title: 'Error',
        message: 'Please drop an image file',
        color: 'red'
      });
      return;
    }

    // Store the file for upload when the form is submitted
    setPendingImageUpload(file);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add this before the handleImageDelete function
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = 'var(--mantine-color-blue-5)';
    e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-5)';
  };


  // Update the handleImageDelete function

  // Add an effect to refetch data when modal closes
  useEffect(() => {
    if (!opened) {
      queryClient.invalidateQueries({ queryKey: ['miniatures'] });
    }
  }, [opened, queryClient]);

  // Add delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (miniId: number) => {
      const response = await fetch(`/api/minis/${miniId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete miniature');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Update the cache to remove the deleted miniature
      queryClient.setQueryData(['minis'], (oldData: Mini[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(mini => mini.id !== miniature?.id);
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting miniature:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete miniature',
        color: 'red'
      });
    }
  });

  const handleDelete = () => {
    modals.openConfirmModal({
      title: 'Delete Miniature',
      centered: true,
      children: (
        <Stack gap="xs">
          <Text size="sm">
            Are you sure you want to delete <strong>{miniature?.name}</strong>? This will also delete:
          </Text>
          <List size="sm">
            <List.Item>All linked type and category associations</List.Item>
            <List.Item>All linked tag associations</List.Item>
            <List.Item>Original and thumbnail images</List.Item>
          </List>
          <Text size="sm" mt={4}>
            This action cannot be undone.
          </Text>
        </Stack>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        if (miniature?.id) {
          deleteMutation.mutate(miniature.id);
        }
      }
    });
  };

  // Helper function to get image path
  const getImagePath = (id: number) => {
    const idStr = id.toString();
    const firstDigit = idStr[0];
    const secondDigit = idStr.length > 1 ? idStr[1] : '0';
    return `/images/miniatures/original/${firstDigit}/${secondDigit}/${id}.webp`;
  };

  // Effect to handle modal open/close
  useEffect(() => {
    if (!opened) {
      // Reset states when modal closes
      setShowImage(false);
      setIsImageLoading(false);
      setImagePreview(null);
    } else {
      // Reset image states when opening modal
      setShowImage(false);
      setIsImageLoading(true);
      setImagePreview(null);
      
      // Set a small delay to allow the modal to render before showing the image
      const timer = setTimeout(() => {
        setShowImage(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [opened, miniature?.id]); // Add miniature?.id as dependency to trigger on miniature change

  // Effect to handle image loading state
  useEffect(() => {
    if (formData?.id && formData.imageStatus?.hasOriginal) {
      setIsImageLoading(true);
      setShowImage(false);
      
      const timer = setTimeout(() => {
        setShowImage(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [formData?.id, formData?.imageStatus?.hasOriginal]);

  // Fix duplicate transition property in image style
  const imageStyle = {
    width: 'calc(100% - 16px)',
    height: 'calc(100% - 16px)',
    objectFit: 'contain',
    opacity: showImage && !isImageLoading ? 1 : 0,
    transform: showImage && !isImageLoading ? 'scale(1)' : 'scale(0.9)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    willChange: 'opacity, transform'
  } as const;

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
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                  border: '1px solid var(--mantine-color-dark-4)',
                  borderRadius: '8px',
                  padding: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginTop: '16px',
                  backgroundColor: 'var(--mantine-color-dark-6)',
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={imageStyle}
                    onLoad={() => setIsImageLoading(false)}
                  />
                ) : formData?.id && formData.imageStatus?.hasOriginal ? (
                  <img
                    src={`${getImagePath(formData.id)}?t=${formData.imageTimestamp}`}
                    alt="Current miniature"
                    style={imageStyle}
                    onLoad={() => setIsImageLoading(false)}
                  />
                ) : (
                  <Stack gap="xs" align="center">
                    <IconUpload size={32} style={{ opacity: 0.5 }} />
                    <Text size="sm">Drag and drop an image here</Text>
                    <Text size="xs" c="dimmed">The image will be uploaded when you save</Text>
                  </Stack>
                )}
                {isImageLoading && (imagePreview || (formData?.id && formData.imageStatus?.hasOriginal)) && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--mantine-color-dark-6)',
                    }}
                  >
                    <Loader size="md" />
                  </div>
                )}
              </div>

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
              <Group grow={false} gap="md">
                <TextInput
                  size="sm"
                  label="Name"
                  value={formData?.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  error={nameError}
                  required
                  placeholder="Enter miniature name"
                  data-autofocus
                  style={{ width: '180px' }}
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
                  style={{ flex: 1 }}
                />
              </Group>

              {/* Description */}
              <Box>
                <Textarea
                  label="Description"
                  value={formData?.description || ''}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, description: e.target.value } : null)}
                  minRows={6}
                  maxRows={6}
                  autosize={false}
                  placeholder="Enter miniature description..."
                  styles={{
                    wrapper: {
                      height: '100px'
                    },
                    input: {
                      height: '100%'
                    }
                  }}
                />
              </Box>

              {/* Tags Section */}
              <Stack gap="xs">
                <Text fw={500}>Tags</Text>
                <TagsInput
                  placeholder="Add tags..."
                  value={formData?.tags?.map((t: { id: number, name: string }) => t.name) || []}
                  onChange={(values) => {
                    setFormData(prev => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        tags: values.map(name => ({
                          id: prev.tags?.find(t => t.name === name)?.id || -1,
                          name
                        }))
                      };
                    });
                  }}
                  data={existingTags?.map((t: { id: number, name: string }) => t.name) || []}
                />
              </Stack>

              {/* Types Section */}
              <Box 
                p="sm"
                mt="xs"
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
                      const selectedType = availableTypes?.find((t: { id: number }) => t.id.toString() === val);
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
                                    {type.category_names && Array.isArray(type.category_names) && type.category_names.length > 0 && (
                                      <Group gap={0} wrap="wrap">
                                        {type.category_names.map((category: string, idx: number) => (
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

        <Group justify="space-between" mt="xl">
          {miniature && (
            <Button 
              color="red" 
              variant="filled"
              leftSection={<IconTrash size={16} />}
              onClick={handleDelete}
            >
              Delete Miniature
            </Button>
          )}
          <Group ml="auto">
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
  const theme = useMantineTheme();
  useMantineColorScheme();
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

  // Handle modal closes
  const handleEditModalClose = () => {
    setEditingMini(null);
    focusFilterInput();
  };

  const handleAddModalClose = () => {
    setIsAddingMini(false);
    focusFilterInput();
  };

  // Load saved view type preference
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const settings = await getSettings();
        if (settings.miniatures_view_type && 
            ['table', 'cards', 'banner', 'timeline'].includes(settings.miniatures_view_type)) {
          setViewType(settings.miniatures_view_type as ViewType);
        }
        // Only set the last page if there's no saved filter
        if (!settings.miniatures_view_last_filter_text && settings.miniatures_view_last_page_visited) {
          setCurrentPage(parseInt(settings.miniatures_view_last_page_visited));
        } else {
          setCurrentPage(1); // Reset to page 1 if there's a filter
        }
        if (settings.miniatures_view_last_filter_text) {
          setFilterText(settings.miniatures_view_last_filter_text);
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  // Save view type preference when changed
  const handleViewChange = async (value: string) => {
    const newViewType = value as ViewType;
    setViewType(newViewType);
    focusFilterInput();
    try {
      await updateSettings({
        setting_key: 'miniatures_view_type',
        setting_value: newViewType
      });
    } catch (error) {
      console.error('Failed to save view preference:', error);
    }
  };

  // Handle page change
  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    focusFilterInput();
    try {
      await updateSettings({
        setting_key: 'miniatures_view_last_page_visited',
        setting_value: page.toString()
      });
    } catch (error) {
      console.error('Failed to save page preference:', error);
    }
  };

  // Handle filter text changes with debounce
  const debouncedSaveFilter = useMemo(
    () =>
      debounce(async (text: string) => {
        try {
          await updateSettings({
            setting_key: 'miniatures_view_last_filter_text',
            setting_value: text
          });
        } catch (error) {
          console.error('Failed to save filter preference:', error);
        }
      }, 500),
    []
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setFilterText(newText);
    setCurrentPage(1);  // Reset to page 1 when filter changes
    debouncedSaveFilter(newText);
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
        minis.map(async (mini: Mini) => {
          const imageStatus = await checkMiniatureImageStatus(mini.id);
          return { ...mini, imageStatus };
        })
      );
      
      return minisWithImageStatus;
    },
    staleTime: 30000 // Consider data fresh for 30 seconds
  });

  // Filter minis
  const filteredMinis = useMemo(() => {
    if (!minis) return [];
    if (!filterText) return minis;

    const searchText = filterText.toLowerCase();
    return minis.filter(mini => {
      // Handle potentially undefined mini object
      if (!mini) return false;

      // Handle arrays that might be undefined
      const types = mini.types || [];
      const categoryNames = mini.category_names || [];
      const tags = mini.tags || [];

      const typeMatch = types.some(type => 
        type?.name?.toLowerCase().includes(searchText)
      );
      
      const categoryMatch = categoryNames.some(cat => 
        cat?.toLowerCase().includes(searchText)
      );
      
      const tagMatch = tags.some(tag => 
        tag?.name?.toLowerCase().includes(searchText)
      );

      return (
        (mini.name || '').toLowerCase().includes(searchText) ||
        (mini.company_name || '').toLowerCase().includes(searchText) ||
        (mini.product_line_name || '').toLowerCase().includes(searchText) ||
        (mini.product_set_name || '').toLowerCase().includes(searchText) ||
        (mini.description || '').toLowerCase().includes(searchText) ||
        (mini.location || '').toLowerCase().includes(searchText) ||
        typeMatch ||
        categoryMatch ||
        tagMatch
      );
    });
  }, [minis, filterText]);

  // Calculate total pages based on filtered results
  const totalPages = Math.ceil((filteredMinis?.length || 0) / ITEMS_PER_PAGE);

  // Get paginated data for non-table views
  const paginatedMinis = useMemo(() => {
    if (viewType === 'table') {
      return filteredMinis; // For table view, return all data and let DataTable handle pagination
    }
    // For other views, handle pagination here
    return filteredMinis.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredMinis, currentPage, viewType]);

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
      minis: viewType === 'table' ? filteredMinis : paginatedMinis, // Pass full data for table view, paginated for others
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
        case 'timeline':
          return <TimelineView {...viewProps} />;
        default:
          return <TableView {...viewProps} />;
      }
    })();
  };

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
                { value: 'banner', label: <Center><IconLayoutList size={16} /><Box ml={8}>Banner</Box></Center> },
                { value: 'timeline', label: <Center><IconClock size={16} /><Box ml={8}>Timeline</Box></Center> }
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
            placeholder="Filter miniatures..."
            value={filterText}
            onChange={handleFilterChange}
            leftSection={<IconSearch size={16} />}
            style={{ 
              marginBottom: theme.spacing.md,
              backgroundColor: theme.colors.dark[7],
              '&:focus': {
                backgroundColor: theme.colors.dark[7],
              }
            }}
          />
          {renderView()}
        </Stack>
      </Card>

      {/* Show pagination for non-table views */}
      {viewType !== 'table' && totalPages > 1 && (
        <Group justify="center">
          <Pagination 
            value={currentPage}
            onChange={handlePageChange}
            total={totalPages}
          />
        </Group>
      )}

      {/* Modals */}
      <MiniatureModal
        opened={!!editingMini || isAddingMini}
        onClose={isAddingMini ? handleAddModalClose : handleEditModalClose}
        miniature={editingMini}
        onImageUpdate={setImageTimestamp}
      />
    </Stack>
  );
} 