/**
 * @file useProductQuery.ts
 * @description Custom hooks for fetching product-related data using TanStack Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCompanies, getProductLines, getProductSetsByLine } from '../../api/productinfo';

interface Company {
  id: number;
  name: string;
}

interface ProductLine {
  id: number;
  name: string;
  company_id: number;
}

interface ProductSet {
  id: number;
  name: string;
  product_line_id: number;
}

export function useCompaniesQuery() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      // First get all companies
      const companies = await getCompanies();
      
      // Then fetch lines for each company and their sets in parallel
      await Promise.all(
        companies.map(async (company) => {
          const lines = await getProductLines(company.id);
          
          // Store the lines data in the query cache
          queryClient.setQueryData(
            ['productLines', company.id],
            lines
          );

          // Fetch and cache sets for each line
          await Promise.all(
            lines.map(async (line) => {
              const sets = await getProductSetsByLine(line.id);
              // Store the sets data in the query cache
              queryClient.setQueryData(
                ['productSets', line.id],
                sets
              );
            })
          );
        })
      );
      
      return companies;
    }
  });
}

export function useProductLinesQuery(companyId: number | null) {
  return useQuery({
    queryKey: ['productLines', companyId],
    queryFn: () => companyId ? getProductLines(companyId) : Promise.resolve([]),
    enabled: !!companyId
  });
}

export function useProductSetsQuery(lineId: number | null) {
  return useQuery({
    queryKey: ['productSets', lineId],
    queryFn: () => lineId ? getProductSetsByLine(lineId) : Promise.resolve([]),
    enabled: !!lineId
  });
} 