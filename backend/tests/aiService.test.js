const { generateTestFromText } = require('../services/aiService');

describe('aiService - generateTestFromText', () => {
    it('should return an empty array for now (placeholder implementation)', async () => {
        const result = await generateTestFromText('some text');
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
    });
});
