/**
 * @file useProductMutations.ts
 * @description Custom hooks for product-related mutations using TanStack Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createCompany, updateCompany, deleteCompany,
  createProductLine, updateProductLine, deleteProductLine,
  createProductSet, updateProductSet, deleteProductSet
} from '../../api/productinfo';

interface MutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function useCompanyMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id?: number; name: string }) => {
      return data.id 
        ? updateCompany(data.id, { name: data.name })
        : createCompany({ name: data.name });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['companies'] });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      callbacks?.onError?.(error);
    }
  });
}

export function useCompanyDeleteMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      callbacks?.onError?.(error);
    }
  });
}

export function useProductLineMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id?: number; name: string; company_id: number }) => {
      return data.id
        ? updateProductLine(data.id, { name: data.name })
        : createProductLine({ name: data.name, company_id: data.company_id });
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['productLines', variables.company_id] });
      await queryClient.invalidateQueries({ queryKey: ['companies'] });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      callbacks?.onError?.(error);
    }
  });
}

export function useProductLineDeleteMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductLine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productLines'] });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      callbacks?.onError?.(error);
    }
  });
}

export function useProductSetMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id?: number; name: string; product_line_id: number }) => {
      return data.id
        ? updateProductSet(data.id, { name: data.name })
        : createProductSet({ name: data.name, product_line_id: data.product_line_id });
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['productSets', variables.product_line_id] });
      await queryClient.invalidateQueries({ queryKey: ['productLines'] });
      await queryClient.invalidateQueries({ queryKey: ['companies'] });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      callbacks?.onError?.(error);
    }
  });
}

export function useProductSetDeleteMutation(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productSets'] });
      callbacks?.onSuccess?.();
    },
    onError: (error: any) => {
      callbacks?.onError?.(error);
    }
  });
} 