const express = require("express");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

// ✅ Admins & Lecturers can create assignments
router.post("/create", authMiddleware, authorizeRoles("admin", "lecturer"), createAssignment);

// ✅ Students submit assignments
router.post("/:id/submit", authMiddleware, authorizeRoles("student"), submitAssignment);

// ✅ Students, Admins & Lecturers can view all assignments
router.get("/", authMiddleware, getAssignments);

// ✅ Get a single assignment by ID
router.get("/:id", authMiddleware, getAssignmentById);

// ✅ Admins & Lecturers can update assignments
router.put("/:id", authMiddleware, authorizeRoles("admin", "lecturer"), updateAssignment);

// ✅ Admins & Lecturers can delete assignments
router.delete("/:id", authMiddleware, authorizeRoles("admin", "lecturer"), deleteAssignment);

module.exports = router;