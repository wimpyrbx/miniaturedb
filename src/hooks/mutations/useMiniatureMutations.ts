/**
 * @file useMiniatureMutations.ts
 * @description Custom hooks for miniature-related mutations using TanStack Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

interface Mini {
  id: number;
  name: string;
  description: string | null;
  location: string;
  quantity: number;
  painted_by_id: number;
  base_size_id: number;
  product_set_id: number | null;
  created_at: string;
  updated_at: string;
  tags?: any[];
  types?: any[];
}

export function useMiniatureMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Mini>) => {
      const response = await fetch(
        data.id ? `/api/minis/${data.id}` : '/api/minis',
        {
          method: data.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save miniature');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minis'] });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      callbacks?.onError?.(error);
    }
  });
}

export function useMiniatureDeleteMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
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
    onSuccess: (_, miniId) => {
      // Update the cache to remove the deleted miniature
      queryClient.setQueryData(['minis'], (oldData: Mini[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(mini => mini.id !== miniId);
      });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      callbacks?.onError?.(error);
    }
  });
} 