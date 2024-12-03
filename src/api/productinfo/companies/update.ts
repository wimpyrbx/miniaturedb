/**
 * @file update.ts
 * @description API endpoints for updating companies
 */

import api from '../../client';
import { Company } from '../../../types/products';

export const updateCompany = async (id: number, data: Partial<Company>): Promise<Company> => {
  const response = await api.put(`/api/productinfo/companies/${id}`, data);
  return response.data;
}; 