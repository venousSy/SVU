const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Material = require('./models/Material');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Material.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany([
      { name: 'Admin User', email: 'admin@svu.edu', password: 'password123' }
    ]);

    const adminUser = createdUsers[0]._id;

    const mockMaterials = [
      { title: 'Network Security Fundamentals', description: 'Comprehensive guide to modern network security protocols and practices for SVU term 5.', fileUrl: '/dummy-path.pdf', uploadedBy: adminUser },
      { title: 'Data Structures Mock Exam', description: 'Practice questions for the final exam focusing on Trees and Graphs.', fileUrl: '/dummy-path.pdf', uploadedBy: adminUser },
      { title: 'React Performance Tuning', description: 'Video lecture going over useMemo, useCallback, and React Profiler.', fileUrl: '/dummy-path.mp4', uploadedBy: adminUser },
      { title: 'Advanced Database Systems', description: 'Study material covering normalization, indexing, and NoSQL databases.', fileUrl: '/dummy-path.pdf', uploadedBy: adminUser },
      { title: 'Software Engineering 2', description: 'Complete summary of chapters 1 to 5 including Agile methodologies.', fileUrl: '/dummy-path.pdf', uploadedBy: adminUser },
      { title: 'AI Ethics & Implications', description: 'Discussion slides on the societal impacts of artificial intelligence.', fileUrl: '/dummy-path.pdf', uploadedBy: adminUser },
    ];

    await Material.insertMany(mockMaterials);
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

importData();
