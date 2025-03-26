const Assignment = require("../models/Assignment");
const mongoose = require("mongoose");

// ✅ Create a new assignment (Admin & Lecturer only)
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (req.user.role !== "admin" && req.user.role !== "lecturer") {
      return res.status(403).json({ message: "Unauthorized access" });
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
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all assignments
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().populate("createdBy", "name email role");
    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get a single assignment
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const assignment = await Assignment.findById(id).populate("createdBy", "name email role");
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update an assignment (Admin & Lecturer only)
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

    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to edit this assignment" });
    }

    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;
    await assignment.save();

    res.json({ message: "Assignment updated successfully", assignment });
  } catch (error) {
    console.error("Error updating assignment:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete an assignment (Admin & Lecturer only)
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

    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this assignment" });
    }

    await assignment.deleteOne();
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Submit an assignment (Students only)
exports.submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can submit assignments" });
    }

    if (assignment.submittedBy.some(submission => submission.user.toString() === req.user.id)) {
      return res.status(400).json({ message: "Assignment already submitted" });
    }

    assignment.submittedBy.push({ user: req.user.id, submittedAt: new Date() });
    await assignment.save();

    res.json({ message: "Assignment submitted successfully", assignment });
  } catch (error) {
    console.error("Error submitting assignment:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
