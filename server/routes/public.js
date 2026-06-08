const express          = require("express");
const router           = express.Router();
const publicController = require("../controllers/publicController");
const { requireLoginPage }              = require("../middleware/authMiddleware");
const { uploadInstructorVerification }  = require("../middleware/uploadMiddleware");

/* ── PUBLIC PAGES ── */
router.get("/",          publicController.getHomePage);
router.get("/home",      (req, res) => res.render("public/home"));
router.get("/error-page",(req, res) => res.render("public/error-page", {
  statusCode: 404,
  errorTitle: "Page Not Found",
  message:    "The page you are looking for does not exist."
}));
router.get("/dashboard", (req, res) => {
  const role = req.session.role;

  const dashboards = {
    student: "/student/dashboard",
    instructor: "/instructor/dashboard",
    admin: "/admin/dashboard"
  };

  res.redirect(dashboards[role] || "/auth/login");
});

/* ── BECOME INSTRUCTOR FLOW ── */
router.get( "/become-instructor",        requireLoginPage, publicController.getBecomeInstructor);
router.post("/become-instructor",        requireLoginPage, publicController.postBecomeInstructor);

router.get( "/become-instructor/step2",  requireLoginPage, publicController.getBecomeInstructorStep2);
router.post("/become-instructor/step2",  requireLoginPage, uploadInstructorVerification, publicController.postBecomeInstructorStep2);

router.get( "/become-instructor/step3",  requireLoginPage, publicController.getBecomeInstructorStep3);
router.post("/become-instructor/step3",  requireLoginPage, publicController.postBecomeInstructorStep3);

/* ── STATIC INFO PAGES ── */
router.get("/instructor-terms", (req, res) => {
  res.render("instructor/instructor-terms", { user: req.session.user || null });
});

module.exports = router;
