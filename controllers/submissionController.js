// controllers/submissionController.js
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");

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

// Get submissions by assignment (Admins & Lecturers)
const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (req.user.role === "admin" || req.user.role === "lecturer") {
      const submissions = await Submission.find({ assignmentId })
        .populate("studentId", "name email");
      return res.status(200).json(submissions);
    }

    const studentSubmission = await Submission.findOne({ assignmentId, studentId: req.user.id })
      .populate("studentId", "name email");

    if (!studentSubmission) {
      return res.status(403).json({ message: "No submission found for you." });
    }

    res.status(200).json(studentSubmission);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all submissions (Admins & Lecturers)
const getAllSubmissions = async (req, res) => {
  try {
    if (!["admin", "lecturer"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }

    const assignments = req.user.role === "admin"
      ? await Assignment.find().select("_id")
      : await Assignment.find({ createdBy: req.user.id }).select("_id");

    const submissions = await Submission.find({ assignmentId: { $in: assignments.map(a => a._id) } })
      .populate("studentId", "name email")
      .populate("assignmentId", "title dueDate");

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Grade a submission (Admins & Lecturers)
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

    if (req.user.role !== "admin" && req.user.role !== "lecturer") {
      return res.status(403).json({ message: "Only lecturers and admins can grade submissions" });
    }
    if (req.user.role === "lecturer" && submission.assignmentId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only grade your own assignments" });
    }

    // Determine letter grade based on numeric grade
    let letterGrade;
    if (grade >= 80) {
      letterGrade = 'A';
    } else if (grade >= 70) {
      letterGrade = 'B';
    } else if (grade >= 60) {
      letterGrade = 'C';
    } else if (grade >= 50) {
      letterGrade = 'D';
    } else if (grade >= 40) {
      letterGrade = 'E';
    } else {
      letterGrade = 'Fail';
    }

    // Update submission with grade, letterGrade, and feedback
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
    .select("assignmentId grade letterGrade feedback"); // Include letterGrade in the select

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Expose functions directly
module.exports = {
  submitAssignment,
  getSubmissionsByAssignment,
  getAllSubmissions,
  gradeSubmission,
  deleteSubmission,
  getMyResults,
};