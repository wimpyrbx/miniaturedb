import api from '../client';
import { UserSettings } from '../../types';

export const getSettings = async (): Promise<UserSettings> => {
  const response = await api.get('/api/settings');
  return response.data;
}; 