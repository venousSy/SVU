const { getMaterials, createMaterial, extractText } = require('../controllers/materialController');
const Material = require('../models/Material');
const pdfService = require('../services/pdfService');
const aiService = require('../services/aiService');
const { downloadRemoteFile } = require('../utils/downloadUtils');
const fs = require('fs');
const path = require('path');

jest.mock('../models/Material');
jest.mock('../services/pdfService');
jest.mock('../services/aiService');
jest.mock('../utils/downloadUtils');
jest.mock('fs');

describe('materialController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            body: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
        console.error = jest.fn();
        console.log = jest.fn();
    });

    describe('getMaterials', () => {
        it('should return all materials if no keyword is provided', async () => {
            const mockMaterials = [{ title: 'Test 1' }, { title: 'Test 2' }];
            Material.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockMaterials)
            });

            await getMaterials(req, res);

            expect(Material.find).toHaveBeenCalledWith({});
            expect(res.json).toHaveBeenCalledWith(mockMaterials);
        });

        it('should return materials matching the keyword if provided', async () => {
            req.query.keyword = 'science';
            const mockMaterials = [{ title: 'Science Material' }];
            
            Material.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockMaterials)
            });

            await getMaterials(req, res);

            expect(Material.find).toHaveBeenCalledWith({
                $or: [
                    { title: { $regex: 'science', $options: 'i' } },
                    { description: { $regex: 'science', $options: 'i' } },
                ]
            });
            expect(res.json).toHaveBeenCalledWith(mockMaterials);
        });

        it('should handle errors and return 500', async () => {
            Material.find.mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error('DB error'))
            });

            await getMaterials(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server Error fetching materials' });
        });
    });

    describe('createMaterial', () => {
        it('should create a material and return 201', async () => {
            req.body = {
                title: 'New Material',
                description: 'Test description',
                fileUrl: 'http://test.com/file',
                type: 'PDF'
            };

            const mockSave = jest.fn().mockResolvedValue(req.body);
            Material.mockImplementation(() => ({
                save: mockSave
            }));

            await createMaterial(req, res);

            expect(mockSave).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(req.body);
        });

        it('should return 400 if title or fileUrl is missing', async () => {
            req.body = { description: 'Missing title' };

            await createMaterial(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Title and File URL are required' });
        });

        it('should handle errors during create and return 500', async () => {
             req.body = { title: 'T', fileUrl: 'F' };
             const mockSave = jest.fn().mockRejectedValue(new Error('DB Save Error'));
             Material.mockImplementation(() => ({
                 save: mockSave
             }));

             await createMaterial(req, res);
             expect(res.status).toHaveBeenCalledWith(500);
             expect(res.json).toHaveBeenCalledWith({ message: 'Server Error creating material' });
        });
    });

    describe('extractText', () => {
        beforeEach(() => {
            req.params.id = 'mat123';
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockImplementation(() => {});
        });

        it('should generate a test from a remote pdf url', async () => {
            const material = { _id: 'mat123', fileUrl: 'http://remote.pdf' };
            Material.findById.mockResolvedValue(material);
            
            downloadRemoteFile.mockResolvedValue('/tmp/material-mat123.pdf');
            pdfService.extractTextFromPDF.mockResolvedValue('Extracted Text');
            aiService.generateTestFromText.mockResolvedValue({ questions: [] });

            await extractText(req, res);

            expect(Material.findById).toHaveBeenCalledWith('mat123');
            expect(downloadRemoteFile).toHaveBeenCalledWith('http://remote.pdf', 'material-mat123');
            expect(pdfService.extractTextFromPDF).toHaveBeenCalledWith('/tmp/material-mat123.pdf');
            expect(aiService.generateTestFromText).toHaveBeenCalledWith('Extracted Text');
            expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/material-mat123.pdf');
            expect(res.json).toHaveBeenCalledWith({
                message: 'Test generated successfully',
                extraction: 'Extracted Text',
                test: { questions: [] }
            });
        });

        it('should handle relative file urls', async () => {
            const material = { _id: 'mat123', fileUrl: './local/file.pdf' };
            Material.findById.mockResolvedValue(material);
            
            pdfService.extractTextFromPDF.mockResolvedValue('Local text');
            aiService.generateTestFromText.mockResolvedValue({ questions: [] });

            await extractText(req, res);

            // Since it's local, downloadRemoteFile and fs.unlinkSync are NOT called
            expect(downloadRemoteFile).not.toHaveBeenCalled();
            expect(fs.unlinkSync).not.toHaveBeenCalled();
            
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 if material not found', async () => {
            Material.findById.mockResolvedValue(null);
            await extractText(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Material not found' });
        });

        it('should return 500 on extraction error', async () => {
            const material = { _id: 'mat123', fileUrl: './local/file.pdf' };
            Material.findById.mockResolvedValue(material);
            
            pdfService.extractTextFromPDF.mockRejectedValue(new Error('PDF break'));

            await extractText(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error generating test from PDF', error: 'PDF break' });
        });
    });
});
