const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment'); // ✅ it ensure that a student can edit a assg after submitting
// ✅ Student submits an assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const submission = await Submission.create({
      assignmentId,
      studentId: req.user.id,
      content
    });

    res.status(201).json({ message: 'Assignment submitted successfully', submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get submissions based on user role (admin can see all, students only see theirs)
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    let submissions;

    if (req.user.role === "admin") {
      // Admins can see all submissions for an assignment
      submissions = await Submission.find({ assignmentId }).populate("studentId", "name email");
    } else {
      // Students can only see their own submission
      submissions = await Submission.find({ assignmentId, studentId: req.user.id }).populate("studentId", "name email");
    }

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin grades a submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    if (grade < 0 || grade > 100) {
      return res.status(400).json({ message: 'Grade must be between 0 and 100' });
    }

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { grade, feedback },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.status(200).json({ message: 'Submission graded successfully', submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.updateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { content } = req.body;

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Check if the user is the owner of the submission
    if (submission.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to edit this submission" });
    }

    // Allow update only if within the deadline
    const assignment = await Assignment.findById(submission.assignmentId);
    if (assignment && new Date() > new Date(assignment.deadline)) {
      return res.status(400).json({ message: "Deadline has passed. You cannot edit this submission." });
    }

    submission.content = content || submission.content;
    await submission.save();

    res.status(200).json({ message: "Submission updated successfully", submission });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

