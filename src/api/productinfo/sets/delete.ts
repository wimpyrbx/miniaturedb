/**
 * @file delete.ts
 * @description API endpoint for deleting product sets
 */

import api from '../../client';

export const deleteProductSet = async (id: number): Promise<void> => {
  await api.delete(`/api/productinfo/sets/${id}`);
}; 