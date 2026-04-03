const { protect } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

jest.mock('jsonwebtoken');
jest.mock('../models/User');

describe('authMiddleware - protect', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should return 401 if no auth header provided', async () => {
        await protect(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token provided' });
    });

    it('should return 401 if auth header does not start with Bearer', async () => {
        req.headers.authorization = 'Basic someweirdtoken';
        await protect(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token provided' });
    });

    it('should call next if token is valid and user is found', async () => {
        req.headers.authorization = 'Bearer validtoken';
        jwt.verify.mockReturnValue({ id: 'user123' });
        
        const mockUser = { _id: 'user123', name: 'Test User' };
        // User.findById returning a chainable select
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });

        await protect(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET || 'fallback_secret');
        expect(User.findById).toHaveBeenCalledWith('user123');
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is valid but user not found', async () => {
        req.headers.authorization = 'Bearer validtoken';
        jwt.verify.mockReturnValue({ id: 'user123' });
        
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, user not found' });
    });

    it('should return 401 if token is invalid or verify throws error', async () => {
        req.headers.authorization = 'Bearer invalidtoken';
        jwt.verify.mockImplementation(() => {
            throw new Error('jwt expired');
        });

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token invalid or expired' });
    });
});
