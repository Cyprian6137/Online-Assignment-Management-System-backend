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

// ✅ Get submissions by assignment (Admins only see their assignments)
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (req.user.role === "admin" && assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied. You can only view submissions for your own assignments." });
    }

    const submissions = await Submission.find({ assignmentId, ...(req.user.role !== "admin" && { studentId: req.user.id }) })
      .populate("studentId", "name email");

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get all submissions (Admins only see their assignments' submissions)
exports.getAllSubmissions = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admins can view submissions." });
    }

    const assignments = await Assignment.find({ createdBy: req.user.id }).select("_id");
    const submissions = await Submission.find({ assignmentId: { $in: assignments.map(a => a._id) } })
      .populate("studentId", "name email")
      .populate("assignmentId", "title dueDate");

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Grade a submission (Admins can only grade their assignments)
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    if (grade < 0 || grade > 100) {
      return res.status(400).json({ message: "Grade must be between 0 and 100" });
    }

    const submission = await Submission.findById(submissionId).populate("assignmentId");
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (req.user.role === "admin" && submission.assignmentId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied. You can only grade submissions for assignments you created." });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    await submission.save();

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
    .populate("assignmentId", "title")
    .select("assignmentId grade feedback");

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
