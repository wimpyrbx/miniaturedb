/**
 * @file useClassificationQuery.ts
 * @description Custom hooks for fetching classification data (types and categories) using TanStack Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';

interface MiniatureType {
  id: number;
  name: string;
  proxy_type: boolean;
  categories?: number[];
  category_names?: string[];
  mini_ids?: number[];
  mini_count?: number;
}

interface MiniatureCategory {
  id: number;
  name: string;
  type_id: number;
}

export function useMiniatureTypesQuery() {
  const queryClient = useQueryClient();

  return useQuery({
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
        const typeId = curr.type_id;
        if (!acc[typeId]) {
          acc[typeId] = [];
        }
        acc[typeId].push(curr);
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
}

export function useMiniatureCategoriesQuery(typeId: number | undefined) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['miniature_categories', typeId],
    queryFn: async () => {
      if (!typeId) return [];
      // Try to get from cache first
      const cached = queryClient.getQueryData<MiniatureCategory[]>(['miniature_categories', typeId]);
      if (cached) return cached;

      // If not in cache, fetch from server
      const response = await fetch(`/api/classification/types/${typeId}/categories`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      
      // Update the cache
      queryClient.setQueryData(['miniature_categories', typeId], data);
      return data;
    },
    enabled: !!typeId,
    staleTime: 30000 // Keep the data fresh for 30 seconds
  });
}

export function useAllCategoriesQuery() {
  return useQuery({
    queryKey: ['all_categories'],
    queryFn: async () => {
      const response = await fetch('/api/classification/categories', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch all categories');
      return response.json();
    },
    staleTime: 30000, // Keep data fresh for 30 seconds
    refetchOnMount: true // Force refetch when component mounts
  });
} 