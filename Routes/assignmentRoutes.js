const express = require("express");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,  // ✅ Added update function
  deleteAssignment,  // ✅ Added delete function
} = require("../controllers/assignmentController");

const router = express.Router();

// ✅ Only Admins (Lecturers) can create assignments
router.post("/create", authMiddleware, authorizeRoles("admin"), createAssignment);

// ✅ Students & Admins can view all assignments
router.get("/", authMiddleware, getAssignments);

// ✅ Get a single assignment by ID
router.get("/:id", authMiddleware, getAssignmentById);

// ✅ Update an assignment (Admin only)
router.put("/:id", authMiddleware, authorizeRoles("admin"), updateAssignment);

// ✅ Delete an assignment (Admin only)
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteAssignment);

module.exports = router;
