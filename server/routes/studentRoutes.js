const express    = require("express");
const router     = express.Router();
const bcrypt     = require("bcryptjs");
const multer     = require("multer");
const User       = require("../models/User");
const studentController = require("../controllers/studentController");
const courseController  = require("../controllers/courseController");

/* ── MULTER  (assignment submission upload) ── */
const submissionUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];
    cb(null, allowed.includes(file.mimetype) ? true : new Error("File type not allowed"));
  }
});

/* ── AUTH MIDDLEWARE ── */
function requireStudentSession(req, res, next) {
  if (!req.session || !req.session.userId) {
    if (req.method === "GET") req.session.returnTo = req.originalUrl;
    return res.redirect("/auth/login");
  }

  if (req.session.role !== "student" && req.session.role !== "instructor") {
    return res.status(403).render("public/error-page", {
      statusCode: 403,
      errorTitle: "Access Denied",
      message: "Students and instructors only."
    });
  }

  next();
}

router.use(requireStudentSession);

/* ══════════════════════════════════════════
   STUDENT PAGES
   ══════════════════════════════════════════ */
router.get("/dashboard",                    studentController.getDashboard);
router.get("/leaderboard",                  studentController.getLeaderboard);
router.get("/my-courses",                   studentController.getMyCourses);
router.get("/payment/:courseId",            studentController.getPaymentPage);
router.get("/start-challenge/:id",          studentController.getStartChallenge);
router.get("/challenge/:id/review",         studentController.getChallengeReview);

router.post("/payment/:courseId",           studentController.processPayment);
router.post("/activate-instructor",         studentController.activateInstructorAccount);
router.post("/challenge/:id/run",           studentController.runCode);
router.post("/challenge/:id/submit",        studentController.submitChallenge);

/* ══════════════════════════════════════════
   COURSE PLAYER
   ══════════════════════════════════════════ */
router.get("/course/:courseId/learn",       courseController.getCourseContent);

/* ══════════════════════════════════════════
   LESSON INTERACTIONS
   ══════════════════════════════════════════ */
router.post("/course/:courseId/lesson/:lessonId/complete",           courseController.markLessonComplete);
router.post("/course/:courseId/lesson/:lessonId/note",               courseController.saveLessonNote);
router.post("/course/:courseId/lesson/:lessonId/submit-assignment",
  submissionUpload.single("submissionFile"),
  courseController.submitAssignment
);

/* ══════════════════════════════════════════
   FILE DOWNLOADS
   ══════════════════════════════════════════ */
router.get("/course/:courseId/lesson/:lessonId/download-resource",   courseController.downloadResource);
router.get("/course/:courseId/lesson/:lessonId/download-assignment",  courseController.downloadAssignment);

/* ══════════════════════════════════════════
   COURSE REVIEW & CERTIFICATE
   ══════════════════════════════════════════ */
router.post("/course/:courseId/review",     courseController.submitReview);
router.get("/certificate/:courseId",        courseController.getCertificate);

/* ══════════════════════════════════════════
   PROFILE  (shared with instructor)
   ══════════════════════════════════════════ */
router.get("/profile", async (req, res) => {
  const user = await User.findById(req.session.userId)
    .populate("completedCourses.course")
    .populate("certificates.course");

  res.render("shared/profile", {
    user,
    completedCourses: user.completedCourses || [],
    certificates:     user.certificates     || []
  });
});

router.get("/edit-profile", async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render("shared/edit-profile", { user, errors: [] });
});

router.post("/edit-profile", async (req, res) => {
  const { name, username, email, bio, location, avatar,
          currentPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect("/auth/login");

  const updateData = {
    name:       name     || user.name,
    username:   username || user.username,
    email:      email    || user.email,
    bio,
    location,
    avatar:     (avatar || "").replace(/^.*\//, ""),
    lastActive: new Date()
  };

  if (newPassword || confirmPassword) {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.render("shared/edit-profile", {
        user, errors: ["Please fill all password fields."]
      });
    }
    if (newPassword !== confirmPassword) {
      return res.render("shared/edit-profile", {
        user, errors: ["New passwords do not match."]
      });
    }
    if (newPassword.length < 8) {
      return res.render("shared/edit-profile", {
        user, errors: ["Password must be at least 8 characters."]
      });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.render("shared/edit-profile", {
        user, errors: ["Current password is incorrect."]
      });
    }
    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  try {
    const updated = await User.findByIdAndUpdate(
      req.session.userId, updateData, { returnDocument: "after" }
    );

    req.session.user = {
      ...req.session.user,
      name:   updated.name,
      email:  updated.email,
      avatar: updated.avatar,
      role:   updated.role
    };

    res.redirect("/student/profile");
  } catch (err) {
    console.error(err);
    const errors = err.code === 11000
      ? ["Email or username is already taken."]
      : ["Something went wrong. Please try again."];
    res.render("shared/edit-profile", { user, errors });
  }
});

module.exports = router;
