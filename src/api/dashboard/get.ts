import { get } from '../fetch';
import type { 
  TypeDistribution, 
  LocationDistribution, 
  CollectionGrowth, 
  PaintedByDistribution,
  ProductLineDistribution 
} from '../../types/dashboard';

export const getTypeDistribution = () => 
  get<TypeDistribution[]>('/api/dashboard/type-distribution');

export const getLocationDistribution = () =>
  get<LocationDistribution[]>('/api/dashboard/location-distribution');

export const getCollectionGrowth = () =>
  get<CollectionGrowth[]>('/api/dashboard/collection-growth');

export const getPaintedByDistribution = () =>
  get<PaintedByDistribution[]>('/api/dashboard/painted-by-distribution');

export const getBaseSizeDistribution = () =>
  get<PaintedByDistribution[]>('/api/dashboard/base-size-distribution');

export const getProductLineDistribution = () =>
  get<ProductLineDistribution[]>('/api/dashboard/product-line-distribution'); 