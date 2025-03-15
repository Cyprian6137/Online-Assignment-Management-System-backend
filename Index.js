require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./Routes/authRoutes');
const assignmentRoutes = require('./Routes/assignmentRoutes');
const submissionRoutes = require('./Routes/submissionRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());

// Configure CORS to allow requests from frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Change this to your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};
app.use(cors(corsOptions));

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
