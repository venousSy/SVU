const protect = async (req, res, next) => {
  // TODO: Implement JWT verification logic
  next();
};

module.exports = { protect };
