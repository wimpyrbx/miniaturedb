import type { TypeDistribution, LocationDistribution, CollectionGrowth } from '../types/dashboard';
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