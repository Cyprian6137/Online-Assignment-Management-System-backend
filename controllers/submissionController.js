const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

// Submit an assignment (Students)
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: "Submission deadline has passed." });
    }

    const existingSubmission = await Submission.findOne({ assignmentId, studentId: req.user.id });
    if (existingSubmission) {
      return res.status(400).json({ message: "You have already submitted this assignment." });
    }

    const submission = await Submission.create({
      assignmentId,
      studentId: req.user.id,
      content,
    });

    res.status(201).json({ message: "Assignment submitted successfully", submission });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get submissions by assignment (Only creator lecturer or admin)
const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if requester is admin or the lecturer who created the assignment
    if (
      req.user.role === "admin" ||
      (req.user.role === "lecturer" && assignment.createdBy.toString() === req.user.id)
    ) {
      const submissions = await Submission.find({ assignmentId })
        .populate("studentId", "name email");
      return res.status(200).json(submissions);
    }

    return res.status(403).json({ message: "You are not authorized to view these submissions." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all submissions (Admins see all; Lecturers only see their own)
const getAllSubmissions = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const submissions = await Submission.find()
        .populate("studentId", "name email")
        .populate("assignmentId", "title dueDate");
      return res.status(200).json(submissions);
    }

    if (req.user.role === "lecturer") {
      const assignments = await Assignment.find({ createdBy: req.user.id }).select("_id");
      const assignmentIds = assignments.map(a => a._id);

      const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
        .populate("studentId", "name email")
        .populate("assignmentId", "title dueDate");

      return res.status(200).json(submissions);
    }

    return res.status(403).json({ message: "Access denied." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Grade a submission (Only for creator lecturer or admin)
const gradeSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;

  if (grade < 0 || grade > 100) {
    return res.status(400).json({ message: "Grade must be between 0 and 100" });
  }

  try {
    const submission = await Submission.findById(submissionId).populate("assignmentId");
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const assignment = submission.assignmentId;

    // Only admin or the assignment creator can grade
    if (
      req.user.role !== "admin" &&
      !(req.user.role === "lecturer" && assignment.createdBy.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: "Not authorized to grade this submission." });
    }

    // Determine letter grade based on numeric grade
    let letterGrade;
    if (grade >= 80) letterGrade = 'A';
    else if (grade >= 70) letterGrade = 'B';
    else if (grade >= 60) letterGrade = 'C';
    else if (grade >= 50) letterGrade = 'D';
    else if (grade >= 40) letterGrade = 'E';
    else letterGrade = 'Fail';

    submission.grade = grade;
    submission.letterGrade = letterGrade;
    submission.feedback = feedback;
    await submission.save();

    res.status(200).json({ message: "Submission graded successfully", submission });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a submission (Only before the deadline)
const deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: "Cannot delete submission after the deadline." });
    }

    if (req.user.role !== "admin" && submission.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own submission before the deadline." });
    }

    await Submission.findByIdAndDelete(submissionId);
    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get graded submissions for the logged-in student
const getMyResults = async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      studentId: req.user.id, 
      grade: { $ne: null }
    })
    .populate("assignmentId", "title")
    .select("assignmentId grade letterGrade feedback");

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all assignment IDs the logged-in student has submitted
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.id }).select("assignmentId");
    const submittedAssignmentIds = submissions.map((s) => s.assignmentId.toString());

    res.status(200).json({ submittedAssignmentIds });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// New: Get all assignments with submission status for logged-in student
const getAssignmentsWithSubmissionStatus = async (req, res) => {
  try {
    const assignments = await Assignment.find().lean();

    const submissions = await Submission.find({ studentId: req.user.id }).select("assignmentId");
    const submittedAssignmentIds = new Set(submissions.map((s) => s.assignmentId.toString()));

    const assignmentsWithStatus = assignments.map((assignment) => ({
      ...assignment,
      status: submittedAssignmentIds.has(assignment._id.toString()) ? "Submitted" : "Not Submitted",
    }));

    res.status(200).json(assignmentsWithStatus);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  submitAssignment,
  getSubmissionsByAssignment,
  getAllSubmissions,
  gradeSubmission,
  deleteSubmission,
  getMyResults,
  getMySubmissions,
  getAssignmentsWithSubmissionStatus,  // new export
};
