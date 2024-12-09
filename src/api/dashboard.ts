import type { TypeDistribution, LocationDistribution, CollectionGrowth, PaintedByDistribution, ProductLineDistribution, CompanyDistribution, SetDistribution, TagDistribution } from '../types/dashboard';
import { API_BASE_URL } from '../config/api';

export async function getTypeDistribution(): Promise<TypeDistribution[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/type-distribution`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch type distribution');
  }
  return response.json();
}

export async function getLocationDistribution(): Promise<LocationDistribution[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/location-distribution`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch location distribution');
  }
  return response.json();
}

export async function getCollectionGrowth(): Promise<CollectionGrowth[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/collection-growth`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch collection growth');
  }
  return response.json();
}

export async function getPaintedByDistribution(): Promise<PaintedByDistribution[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/painted-by-distribution`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch painted by distribution');
  }
  return response.json();
}

export async function getBaseSizeDistribution(): Promise<PaintedByDistribution[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/base-size-distribution`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch base size distribution');
  }
  return response.json();
}

export async function getProductLineDistribution(): Promise<ProductLineDistribution[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/product-line-distribution`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch product line distribution');
  }
  return response.json();
}

export async function getTopCompanyDistribution(): Promise<CompanyDistribution[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/top-company-distribution`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch top company distribution');
  }
  return response.json();
}

export async function getTopSetDistribution(): Promise<SetDistribution[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/top-set-distribution`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch top set distribution');
  }
  return response.json();
}

export async function getTagDistribution(): Promise<TagDistribution[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/tag-distribution`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch tag distribution');
  }
  return response.json();
} 