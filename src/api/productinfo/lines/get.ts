/**
 * @file get.ts
 * @description API endpoints for retrieving product lines data
 */

import api from '../../client';
import { ProductLine } from '../../../types/products';

export const getProductLines = async (companyId: number): Promise<ProductLine[]> => {
  const response = await api.get(`/api/productinfo/companies/${companyId}/lines`);
  return response.data;
};

export const getProductLine = async (id: number): Promise<ProductLine> => {
  const response = await api.get(`/api/productinfo/lines/${id}`);
  return response.data;
}; 