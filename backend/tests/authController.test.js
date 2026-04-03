const { loginUser, registerUser, googleAuth } = require('../controllers/authController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

jest.mock('../models/User');
jest.mock('jsonwebtoken');
jest.mock('google-auth-library');

describe('authController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('loginUser', () => {
        it('should return 200 and a generic message', async () => {
            await loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Login endpoint' });
        });
    });

    describe('registerUser', () => {
        it('should return 200 and a generic message', async () => {
            await registerUser(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Register endpoint' });
        });
    });

    describe('googleAuth', () => {
        it('should login an existing user', async () => {
            req.body.token = 'google-valid-token';
            
            const mockVerifyIdToken = jest.fn().mockResolvedValue({
                getPayload: () => ({ email: 'test@test.com', name: 'Test User', sub: '12345' })
            });

            OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

            User.findOne.mockResolvedValue({ _id: 'user123', id: 'user123', name: 'Test User', email: 'test@test.com' });
            jwt.sign.mockReturnValue('jwt-token-123');

            await googleAuth(req, res);

            expect(mockVerifyIdToken).toHaveBeenCalledWith({
                idToken: 'google-valid-token',
                audience: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
            });
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                _id: 'user123',
                name: 'Test User',
                email: 'test@test.com',
                token: 'jwt-token-123'
            });
        });

        it('should create a new user if they do not exist', async () => {
            req.body.token = 'google-valid-token';
            
            const mockVerifyIdToken = jest.fn().mockResolvedValue({
                getPayload: () => ({ email: 'new@test.com', name: 'New User', sub: '12345' })
            });

            OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ _id: 'newuser123', id: 'newuser123', name: 'New User', email: 'new@test.com' });
            jwt.sign.mockReturnValue('jwt-token-456');

            await googleAuth(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'new@test.com' });
            expect(User.create).toHaveBeenCalledWith({
                name: 'New User',
                email: 'new@test.com',
                authProvider: 'google'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                _id: 'newuser123',
                name: 'New User',
                email: 'new@test.com',
                token: 'jwt-token-456'
            });
        });

        it('should handle verify errors', async () => {
             req.body.token = 'google-invalid-token';
            
            const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error('Invalid token'));
            OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

            await googleAuth(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Authentication failed', error: 'Invalid token' });
        });

        it('should handle missing user data after creation fails (if any)', async () => {
             req.body.token = 'google-valid-token';
             const mockVerifyIdToken = jest.fn().mockResolvedValue({
                getPayload: () => ({ email: 'fail@test.com', name: 'Fail User', sub: '123' })
            });
            OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue(null); // Simulate creation failure returning empty

            await googleAuth(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user data' });
        });
    });
});
