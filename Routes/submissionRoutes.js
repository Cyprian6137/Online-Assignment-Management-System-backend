const express = require("express");
const {
  submitAssignment,
  getSubmissionsByAssignment,
  getAllSubmissions,
  gradeSubmission,
  deleteSubmission,
  getMyResults,
  getMySubmissions,
  getAssignmentsWithSubmissionStatus, // <-- new import
} = require("../controllers/submissionController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Student gets all their submitted assignments (IDs only)
router.get("/my-submissions", authMiddleware, getMySubmissions);

// ✅ Student gets their own graded results
router.get("/my-results", authMiddleware, getMyResults);

// ✅ Student submits an assignment (only once per assignment)
router.post("/submit", authMiddleware, submitAssignment);

// ✅ Get submissions for a specific assignment (Admin & Lecturers)
router.get("/:assignmentId/submissions", authMiddleware, getSubmissionsByAssignment);

// ✅ Get all submissions (Admins & Lecturers)
router.get("/", authMiddleware, authorizeRoles("admin", "lecturer"), getAllSubmissions);

// ✅ Admin or Lecturer grades a submission
router.put("/:submissionId/grade", authMiddleware, authorizeRoles("admin", "lecturer"), gradeSubmission);

// ✅ Delete a submission (Students only before deadline)
router.delete("/:submissionId", authMiddleware, deleteSubmission);

// NEW: Get all assignments with submission status for logged-in student
router.get("/assignments-with-status", authMiddleware, getAssignmentsWithSubmissionStatus);

module.exports = router;
