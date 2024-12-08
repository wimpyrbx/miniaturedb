import { get } from '../fetch';
import type { TypeDistribution, LocationDistribution, CollectionGrowth } from '../../types/dashboard';

export const getTypeDistribution = () => 
  get<TypeDistribution[]>('/api/dashboard/type-distribution');

export const getLocationDistribution = () =>
  get<LocationDistribution[]>('/api/dashboard/location-distribution');

export const getCollectionGrowth = () =>
  get<CollectionGrowth[]>('/api/dashboard/collection-growth'); 