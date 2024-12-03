/**
 * @file get.ts
 * @description API endpoints for retrieving companies data
 */

import api from '../../client';
import { Company } from '../../../types/products';

export const getCompanies = async (): Promise<Company[]> => {
  const response = await api.get('/api/productinfo/companies');
  return response.data;
};

export const getCompany = async (id: number): Promise<Company> => {
  const response = await api.get(`/api/productinfo/companies/${id}`);
  return response.data;
}; 