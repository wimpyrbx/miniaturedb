/**
 * @file create.ts
 * @description API endpoints for creating product sets
 */

import api from '../../client';
import { ProductSet } from '../../../types/products';

export const createProductSet = async (data: Omit<ProductSet, 'id'>): Promise<ProductSet> => {
  const response = await api.post('/api/productinfo/sets', data);
  return response.data;
}; 