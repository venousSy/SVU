const { generateTestFromText } = require('../services/aiService');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

jest.mock('@google/generative-ai');
jest.mock('axios');

describe('aiService - generateTestFromText', () => {
    let originalEnv;

    beforeEach(() => {
        originalEnv = process.env;
        process.env = { ...originalEnv };
        jest.clearAllMocks();
        console.log = jest.fn();
        console.warn = jest.fn();
        console.error = jest.fn();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should throw error if GENAI_API_KEY is missing', async () => {
        delete process.env.GENAI_API_KEY;
        await expect(generateTestFromText('some text')).rejects.toThrow('Missing Gemini API Key. Please check Railway variables.');
    });

    it('should generate test using SDK model', async () => {
        process.env.GENAI_API_KEY = 'test_api_key';

        // Mock axios for _testApiKeyAndListModels
        axios.get.mockResolvedValue({ data: { models: [{ name: 'models/gemini-pro' }] } });

        const mockResponse = {
            response: {
                text: jest.fn().mockReturnValue(JSON.stringify({ test_metadata: {}, questions: [] }))
            }
        };

        const mockModel = {
            generateContent: jest.fn().mockResolvedValue(mockResponse)
        };

        GoogleGenerativeAI.mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue(mockModel)
        }));

        const result = await generateTestFromText('Educational text about biology');
        
        expect(axios.get).toHaveBeenCalled();
        expect(result).toHaveProperty('test_metadata');
        expect(result).toHaveProperty('questions');
    });

    it('should strip markdown formatting if returned by SDK', async () => {
         process.env.GENAI_API_KEY = 'test_api_key';
         axios.get.mockResolvedValue({ data: { models: [] } });

         const mockResponse = {
             response: {
                 text: jest.fn().mockReturnValue(`\`\`\`json\n{"test_metadata": {}, "questions": []}\n\`\`\``)
             }
         };

         const mockModel = {
             generateContent: jest.fn().mockResolvedValue(mockResponse)
         };

         GoogleGenerativeAI.mockImplementation(() => ({
             getGenerativeModel: jest.fn().mockReturnValue(mockModel)
         }));

         const result = await generateTestFromText('text');
         expect(result).toHaveProperty('questions');
    });

    it('should fallback to REST call if SDK fails', async () => {
        process.env.GENAI_API_KEY = 'test_api_key';
        axios.get.mockResolvedValue({ data: { models: [] } });

        const mockModel = {
            generateContent: jest.fn().mockRejectedValue(new Error('SDK Error'))
        };

        GoogleGenerativeAI.mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue(mockModel)
        }));

        // Mock REST fallback axios.post
        axios.post.mockResolvedValue({
            data: {
                candidates: [
                    { content: { parts: [{ text: JSON.stringify({ test_metadata: {}, questions: [{ id: "q1" }] }) }] } }
                ]
            }
        });

        const result = await generateTestFromText('fallback text');
        expect(axios.post).toHaveBeenCalled();
        expect(result.questions).toHaveLength(1);
        expect(result.questions[0].id).toBe('q1');
    });

    it('should throw an error if both SDK and REST fail', async () => {
        process.env.GENAI_API_KEY = 'test_api_key';
        axios.get.mockRejectedValue(new Error('List models fail'));

        const mockModel = {
            generateContent: jest.fn().mockRejectedValue(new Error('SDK Error'))
        };

        GoogleGenerativeAI.mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue(mockModel)
        }));

        axios.post.mockRejectedValue(new Error('REST Error'));

        await expect(generateTestFromText('fail everywhere')).rejects.toThrow(/AI Generation failed entirely/);
    });
});
