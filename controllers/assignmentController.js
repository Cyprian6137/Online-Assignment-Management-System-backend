const Assignment = require("../models/Assignment");
const mongoose = require("mongoose");

// ✅ Create a new assignment (Admin only)
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const existingAssignment = await Assignment.findOne({ title, createdBy: req.user.id });
    if (existingAssignment) {
      return res.status(400).json({ message: "An assignment with this title already exists" });
    }

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Assignment created successfully", assignment });
  } catch (error) {
    console.error("Error creating assignment:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get assignments created by the logged-in admin only
exports.getAssignments = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Fetch assignments created only by the logged-in admin
    const assignments = await Assignment.find({ createdBy: req.user.id }).populate("createdBy", "name email");

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get a single assignment (Admin can only see their own)
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Ensure only the admin who created it can view
    if (req.user.id !== assignment.createdBy.toString()) {
      return res.status(403).json({ message: "Unauthorized to view this assignment" });
    }

    res.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update an assignment (Admin only)
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Ensure only the admin who created it can update
    if (req.user.id !== assignment.createdBy.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this assignment" });
    }

    // Prevent duplicate assignment titles for the same admin
    if (title && title !== assignment.title) {
      const existingAssignment = await Assignment.findOne({ title, createdBy: req.user.id });
      if (existingAssignment) {
        return res.status(400).json({ message: "An assignment with this title already exists" });
      }
    }

    // Update fields
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;

    await assignment.save();
    res.json({ message: "Assignment updated successfully", assignment });
  } catch (error) {
    console.error("Error updating assignment:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete an assignment (Admin only)
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Ensure only the admin who created it can delete
    if (req.user.id !== assignment.createdBy.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this assignment" });
    }

    await assignment.deleteOne();
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
