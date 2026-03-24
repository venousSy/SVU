const { getMaterials, createMaterial } = require('../controllers/materialController');
const Material = require('../models/Material');

jest.mock('../models/Material');

describe('materialController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
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
    });
});
