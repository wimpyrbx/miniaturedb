/**
 * @file delete.ts
 * @description API endpoint for deleting product lines
 */

import api from '../../client';

export const deleteProductLine = async (id: number): Promise<void> => {
  await api.delete(`/api/productinfo/lines/${id}`);
}; 