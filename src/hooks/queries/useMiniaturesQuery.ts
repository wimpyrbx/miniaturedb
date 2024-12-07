/**
 * @file useMiniaturesQuery.ts
 * @description Custom hook for fetching miniatures data using TanStack Query
 */

import { useQuery } from '@tanstack/react-query';
import { checkMiniatureImageStatus } from '../../utils/imageUtils';

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
  imageStatus?: any;
}

export function useMiniaturesQuery() {
  return useQuery<Mini[]>({
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
} 