const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// Get dashboard data for students
const getStudentDashboardData = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Count total assignments created by lecturers
    const totalAssignments = await Assignment.countDocuments();

    // Count submissions for the student
    const submittedAssignments = await Submission.find({ studentId });
    const pendingSubmissions = totalAssignments - submittedAssignments.length;

    // Count grades received (assuming grades are stored in Submission)
    const gradesReceived = submittedAssignments.filter(sub => sub.grade !== undefined).length;

    res.json({
      totalAssignments,
      pendingSubmissions,
      gradesReceived,
    });
  } catch (error) {
    console.error("Error fetching student dashboard data:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStudentDashboardData,
};