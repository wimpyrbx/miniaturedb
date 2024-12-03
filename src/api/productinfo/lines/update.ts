/**
 * @file update.ts
 * @description API endpoints for updating product lines
 */

import api from '../../client';
import { ProductLine } from '../../../types/products';

export const updateProductLine = async (id: number, data: Partial<ProductLine>): Promise<ProductLine> => {
  const response = await api.put(`/api/productinfo/lines/${id}`, data);
  return response.data;
}; 