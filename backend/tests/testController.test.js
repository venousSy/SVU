const { saveTest, getTestByMaterialId, getAllTests, getUserTestCount } = require('../controllers/testController');
const MockTest = require('../models/MockTest');

jest.mock('../models/MockTest');

describe('testController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: { _id: 'user123' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
        console.error = jest.fn();
    });

    describe('saveTest', () => {
        it('should return 400 if materialId or testContent is missing', async () => {
            req.body = { materialId: 'mat123' }; // missing testContent
            await saveTest(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'materialId and testContent are required' });
        });

        it('should return 403 if user has reached the test limit of 5', async () => {
            req.body = { materialId: 'mat123', testContent: {} };
            MockTest.countDocuments.mockResolvedValue(5);

            await saveTest(req, res);

            expect(MockTest.countDocuments).toHaveBeenCalledWith({ createdBy: 'user123' });
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'You have reached the limit of 5 created tests. You can still view any existing tests.',
                limitReached: true,
                count: 5
            });
        });

        it('should save test and return 201 if under limit', async () => {
            req.body = { materialId: 'mat123', testContent: { q: '1' } };
            MockTest.countDocuments.mockResolvedValue(2);

            const mockSavedTest = { _id: 'test1', ...req.body, createdBy: 'user123' };
            const mockSave = jest.fn().mockResolvedValue(mockSavedTest);
            MockTest.mockImplementation(() => ({
                save: mockSave
            }));

            await saveTest(req, res);

            expect(mockSave).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockSavedTest);
        });

        it('should return 500 on save error', async () => {
            req.body = { materialId: 'mat123', testContent: {} };
            MockTest.countDocuments.mockResolvedValue(2);
            MockTest.mockImplementation(() => ({
                save: jest.fn().mockRejectedValue(new Error('DB Save fail'))
            }));

            await saveTest(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server Error saving mock test' });
        });
    });

    describe('getTestByMaterialId', () => {
        it('should return 404 if no test found', async () => {
             req.params.materialId = 'mat123';
             MockTest.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

             await getTestByMaterialId(req, res);

             expect(res.status).toHaveBeenCalledWith(404);
             expect(res.json).toHaveBeenCalledWith({ message: 'No test found for this material' });
        });

        it('should return test array and count if tests exist', async () => {
             req.params.materialId = 'mat123';
             const mockTests = [{ _id: 't1' }];
             MockTest.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockTests) });

             await getTestByMaterialId(req, res);

             expect(res.json).toHaveBeenCalledWith({ tests: mockTests, count: 1 });
        });

        it('should handle errors returning 500', async () => {
             req.params.materialId = 'mat123';
             MockTest.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('DB Find fail')) });

             await getTestByMaterialId(req, res);
             expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getAllTests', () => {
        it('should return all tests populated', async () => {
             const mockTests = [{ _id: 't1' }, { _id: 't2' }];
             const mockPopulate = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(mockTests) });
             MockTest.find.mockReturnValue({ populate: mockPopulate });

             await getAllTests(req, res);

             expect(res.json).toHaveBeenCalledWith(mockTests);
        });

        it('should handle error returning 500', async () => {
             MockTest.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('x')) }) });
             await getAllTests(req, res);
             expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getUserTestCount', () => {
        it('should return user count, limit and reached status', async () => {
             MockTest.countDocuments.mockResolvedValue(3);
             await getUserTestCount(req, res);
             expect(res.json).toHaveBeenCalledWith({ count: 3, limit: 5, limitReached: false });
        });

        it('should handle errors returning 500', async () => {
             MockTest.countDocuments.mockRejectedValue(new Error('DB Err'));
             await getUserTestCount(req, res);
             expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
