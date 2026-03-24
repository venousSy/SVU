const { protect } = require('../middleware/authMiddleware');

describe('authMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('protect', () => {
        it('should call next() for now as it is a placeholder', async () => {
            await protect(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
