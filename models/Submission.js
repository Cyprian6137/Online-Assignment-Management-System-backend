// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
    index: true // Index for performance
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for performance
  },
  content: {
    type: String,
    required: true
  },
  grade: {
    type: Number, // Grade out of 100
    min: 0,
    max: 100
  },
  letterGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'Fail'], // Optional: restrict to valid letter grades
  },
  feedback: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);