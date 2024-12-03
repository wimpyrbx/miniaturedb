/**
 * @file create.ts
 * @description API endpoints for creating companies
 */

import api from '../../client';
import { Company } from '../../../types/products';

export const createCompany = async (data: Omit<Company, 'id'>): Promise<Company> => {
  const response = await api.post('/api/productinfo/companies', data);
  return response.data;
}; 