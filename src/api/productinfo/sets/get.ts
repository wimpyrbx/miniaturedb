/**
 * @file get.ts
 * @description API endpoints for retrieving product sets data
 */

import api from '../../client';
import { ProductSet } from '../../../types/products';

export const getProductSets = async (): Promise<ProductSet[]> => {
  const response = await api.get('/api/productinfo/sets');
  return response.data;
};

export const getProductSetsByLine = async (lineId: number): Promise<ProductSet[]> => {
  const response = await api.get(`/api/productinfo/lines/${lineId}/sets`);
  return response.data;
};

export const getProductSet = async (id: number): Promise<ProductSet> => {
  const response = await api.get(`/api/productinfo/sets/${id}`);
  return response.data;
}; 