/**
 * @file delete.ts
 * @description API endpoint for deleting companies
 */

import api from '../../client';

export const deleteCompany = async (id: number): Promise<void> => {
  await api.delete(`/api/productinfo/companies/${id}`);
}; 