import api from './client';

export const get = async <T>(url: string): Promise<T> => {
  const response = await api.get(url);
  return response.data;
};

export const post = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.post(url, data);
  return response.data;
};

export const put = async <T>(url: string, data: any): Promise<T> => {
  const response = await api.put(url, data);
  return response.data;
};

export const del = async <T>(url: string): Promise<T> => {
  const response = await api.delete(url);
  return response.data;
}; 