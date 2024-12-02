import api from '../client';

interface SettingUpdate {
  setting_key: string;
  setting_value: string;
}

export const updateSettings = async (setting: SettingUpdate): Promise<void> => {
  const response = await api.put('/api/settings', setting);
  return response.data;
}; 