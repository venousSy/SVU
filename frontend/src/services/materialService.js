import api from '../api';

export const fetchMaterials = async (keyword = '') => {
  const response = await api.get(`/materials?keyword=${keyword}`);
  return response.data;
};

export const createMaterial = async (data) => {
  const response = await api.post('/materials', data);
  return response.data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('document', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
