const Submission = require('../models/Submission');

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

exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const submissions = await Submission.find({ assignmentId }).populate('studentId', 'name email');

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
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