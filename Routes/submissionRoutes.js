const express = require("express");
const {submitAssignment, getSubmissionsByAssignment,getAllSubmissions,gradeSubmission,  deleteSubmission,} = require("../controllers/submissionController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const router = express.Router();

// ✅ Student submits an assignment
router.post("/submit", authMiddleware, submitAssignment);

// ✅ Get submissions for a specific assignment (Admin sees all, students see theirs)
router.get("/:assignmentId/submissions", authMiddleware, getSubmissionsByAssignment);

// ✅ Get all submissions (Admin Dashboard)
router.get("/", authMiddleware, authorizeRoles("admin"), getAllSubmissions);

// ✅ Admin grades a submission
router.put("/:submissionId/grade", authMiddleware, authorizeRoles("admin"), gradeSubmission);

// ✅ Delete a submission (Allowed before deadline)
router.delete("/:submissionId/delete", authMiddleware, deleteSubmission);

module.exports = router;
