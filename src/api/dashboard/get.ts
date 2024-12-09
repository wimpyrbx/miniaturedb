import { get } from '../fetch';
import type { 
  TypeDistribution, 
  LocationDistribution, 
  CollectionGrowth, 
  PaintedByDistribution,
  ProductLineDistribution,
  CompanyDistribution,
  SetDistribution,
  TagDistribution
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

export const getTopCompanyDistribution = () =>
  get<CompanyDistribution[]>('/api/dashboard/top-company-distribution');

export const getTopSetDistribution = () =>
  get<SetDistribution[]>('/api/dashboard/top-set-distribution');

export const getTagDistribution = () =>
  get<TagDistribution[]>('/api/dashboard/tag-distribution'); 