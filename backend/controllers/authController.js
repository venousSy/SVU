const loginUser = async (req, res) => {
  // TODO: Add logic for logging in users
  res.status(200).json({ message: 'Login endpoint' });
};

const registerUser = async (req, res) => {
  // TODO: Add logic for registering users
  res.status(200).json({ message: 'Register endpoint' });
};

module.exports = { loginUser, registerUser };
