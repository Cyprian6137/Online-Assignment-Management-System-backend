const Assignment = require('../models/Assignment');

exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      createdBy: req.user.id
    });

    res.status(201).json({ message: 'Assignment created successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    // All users (students and admins) can view assignments
    const assignments = await Assignment.find().populate('createdBy', 'name email');

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
