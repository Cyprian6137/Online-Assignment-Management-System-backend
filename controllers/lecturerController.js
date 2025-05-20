const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const User = require('../models/User'); // Ensure this points to the correct User model

// Get dashboard data for lecturers
const getLecturerDashboardData = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    // Count total assignments created by the lecturer
    const totalAssignments = await Assignment.countDocuments({ createdBy: lecturerId });

    // Get all students
    const totalStudents = await User.countDocuments({ role: "student" });

    // Get all submissions for assignments created by the lecturer
    const submissions = await Submission.find({
      assignmentId: { $in: await Assignment.find({ createdBy: lecturerId }).select('_id') }
    });

    // Calculate pending submissions
    const submittedStudentIds = new Set(submissions.map(sub => sub.studentId.toString()));
    const pendingSubmissions = totalStudents - submittedStudentIds.size;

    res.json({
      totalAssignments,
      pendingSubmissions,
      totalStudents,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLecturerDashboardData,
};