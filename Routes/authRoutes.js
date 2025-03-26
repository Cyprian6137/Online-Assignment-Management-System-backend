const express = require('express');
const {
  registerUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser
} = require('../controllers/authController');

const router = express.Router();

// Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// User Management Routes
router.get('/users', getAllUsers); // Get all students and lecturers
router.put('/users/:id', updateUser); // Update user details
router.delete('/users/:id', deleteUser); // Delete a user

module.exports = router;
