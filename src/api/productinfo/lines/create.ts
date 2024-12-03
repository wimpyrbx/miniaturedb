/**
 * @file create.ts
 * @description API endpoints for creating product lines
 */

import api from '../../client';
import { ProductLine } from '../../../types/products';

export const createProductLine = async (data: Omit<ProductLine, 'id'>): Promise<ProductLine> => {
  const response = await api.post('/api/productinfo/lines', data);
  return response.data;
}; 