const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  submittedBy: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submittedAt: { type: Date, default: Date.now },
    }
  ], // Track submissions with timestamp
});

const Assignment = mongoose.model("Assignment", AssignmentSchema);
module.exports = Assignment;