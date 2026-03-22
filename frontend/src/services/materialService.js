import api from '../api';

export const fetchMaterials = async (keyword = '') => {
  const response = await api.get(`/materials?keyword=${keyword}`);
  return response.data;
};

export const createMaterial = async (data) => {
  const response = await api.post('/materials', data);
  return response.data;
};
