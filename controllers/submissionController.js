const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");

// ✅ Submit an assignment (Students)
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Check if the assignment exists and if the deadline has passed
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: "Submission deadline has passed." });
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

// ✅ Get submissions by assignment (Admins see all, Students see theirs)
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    let submissions;

    if (req.user.role === "admin") {
      submissions = await Submission.find({ assignmentId }).populate("studentId", "name email");
    } else {
      submissions = await Submission.find({ assignmentId, studentId: req.user.id }).populate("studentId", "name email");
    }

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get all submissions (Admin Dashboard)
exports.getAllSubmissions = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admins can view all submissions." });
    }

    const submissions = await Submission.find()
      .populate("studentId", "name email")
      .populate("assignmentId", "title dueDate");

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Grade a submission (Admin Only)
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    if (grade < 0 || grade > 100) {
      return res.status(400).json({ message: "Grade must be between 0 and 100" });
    }

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { grade, feedback },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.status(200).json({ message: "Submission graded successfully", submission });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ✅ Delete a submission (Allowed before the deadline)
exports.deleteSubmission = async (req, res) => {
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

    // Prevent deletion if the deadline has passed
    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: "Cannot delete submission after the deadline." });
    }

    // Ensure the student owns the submission
    if (req.user.role !== "admin" && submission.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own submission before the deadline." });
    }

    await Submission.findByIdAndDelete(submissionId);
    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get graded submissions for the logged-in student
exports.getMyResults = async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      studentId: req.user.id, 
      grade: { $ne: null } // Fetch only graded assignments
    })
    .populate("assignmentId", "title") // Get assignment title
    .select("assignmentId grade feedback"); // Select only necessary fields

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
