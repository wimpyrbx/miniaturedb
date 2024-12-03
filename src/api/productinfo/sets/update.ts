/**
 * @file update.ts
 * @description API endpoints for updating product sets
 */

import api from '../../client';
import { ProductSet } from '../../../types/products';

export const updateProductSet = async (id: number, data: Partial<ProductSet>): Promise<ProductSet> => {
  const response = await api.put(`/api/productinfo/sets/${id}`, data);
  return response.data;
}; 