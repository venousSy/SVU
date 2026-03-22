import api from '../api';

export const fetchMaterials = async (keyword = '') => {
  const response = await api.get(`/materials?keyword=${keyword}`);
  return response.data;
};
