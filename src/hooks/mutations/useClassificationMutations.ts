/**
 * @file useClassificationMutations.ts
 * @description Custom hooks for classification-related mutations using TanStack Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function useTypeMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miniature_types'] });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      callbacks?.onError?.(error);
    }
  });
}

export function useTypeDeleteMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/classification/types/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete type');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miniature_types'] });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      callbacks?.onError?.(error);
    }
  });
}

export function useCategoryMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
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
      
      // Force refetch of types and all categories
      queryClient.invalidateQueries({ 
        queryKey: ['miniature_types'],
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['all_categories'],
        refetchType: 'all'
      });

      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      callbacks?.onError?.(error);
    }
  });
}

export function useCategoryDeleteMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, typeId }: { categoryId: number; typeId: number }) => {
      const response = await fetch(`/api/classification/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete category');
      return { categoryId, typeId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['miniature_categories', variables.typeId] 
      });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      callbacks?.onError?.(error);
    }
  });
} 