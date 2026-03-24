import { describe, it, expect, vi } from 'vitest';
import api from '../../api';
import { fetchMaterials, createMaterial, uploadFile } from '../materialService';

vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('materialService', () => {
  describe('fetchMaterials', () => {
    it('should call api.get with the keyword and return data', async () => {
      const mockData = [{ id: 1, title: 'Test' }];
      api.get.mockResolvedValue({ data: mockData });

      const result = await fetchMaterials('science');

      expect(api.get).toHaveBeenCalledWith('/materials?keyword=science');
      expect(result).toEqual(mockData);
    });
  });

  describe('createMaterial', () => {
    it('should call api.post with the data and return response data', async () => {
      const mockMaterial = { title: 'New' };
      api.post.mockResolvedValue({ data: mockMaterial });

      const result = await createMaterial(mockMaterial);

      expect(api.post).toHaveBeenCalledWith('/materials', mockMaterial);
      expect(result).toEqual(mockMaterial);
    });
  });

  describe('uploadFile', () => {
    it('should call api.post with FormData', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      api.post.mockResolvedValue({ data: { url: 'http://test.com/file' } });

      const result = await uploadFile(mockFile);

      expect(api.post).toHaveBeenCalledWith('/upload', expect.any(FormData), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result.url).toBe('http://test.com/file');
    });
  });
});
