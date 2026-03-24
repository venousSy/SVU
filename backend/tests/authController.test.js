const { loginUser, registerUser } = require('../controllers/authController');

describe('authController', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
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
});
