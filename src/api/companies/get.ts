/**
 * @file get.ts
 * @description API endpoints for retrieving production companies data
 */

import api from '../client';
import { Company, ProductLine, ProductSet } from '../../types/products';

export const getCompanies = async (): Promise<Company[]> => {
  const response = await api.get('/api/companies');
  return response.data;
};

export const getCompany = async (id: number): Promise<Company> => {
  const response = await api.get(`/api/companies/${id}`);
  return response.data;
};

export const getProductLines = async (companyId: number): Promise<ProductLine[]> => {
  const response = await api.get(`/api/companies/${companyId}/lines`);
  return response.data;
};

export const getProductSets = async (lineId: number): Promise<ProductSet[]> => {
  const response = await api.get(`/api/product-lines/${lineId}/sets`);
  return response.data;
}; 