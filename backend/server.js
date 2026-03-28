const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const materialRoutes = require('./routes/materialRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const testRoutes = require('./routes/testRoutes');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/materials', materialRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tests', testRoutes);

// Serve Frontend in Production
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get(['/', '/*splat'], (req, res) =>
    res.sendFile(
      path.resolve(__dirname, '../', 'frontend', 'dist', 'index.html')
    )
  );
} else {
  app.get('/', (req, res) => {
      res.send('SVU ConnectHub Backend API is Running');
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
