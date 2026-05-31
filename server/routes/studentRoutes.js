const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Course = require("../models/Course");
const studentController = require("../controllers/studentController");

function requireStudentSession(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  if (req.session.role !== "student" && req.session.role !== "instructor") {
    return res.redirect("/dashboard");
  }

  next();
}

router.use(requireStudentSession);

router.get("/dashboard", studentController.getDashboard);
router.get("/leaderboard", studentController.getLeaderboard);
router.get("/payment/:courseId", studentController.getPaymentPage);
router.get("/my-courses", studentController.getMyCourses);
router.get("/start-challenge/:id", studentController.getStartChallenge);
router.post("/payment/:courseId", studentController.processPayment);
router.post("/activate-instructor", studentController.activateInstructorAccount);

// ── COURSE PLAYER ──
router.get("/course/:courseId/learn", async (req, res) => {
  try {
    const userId = req.session.userId;
    const course = await Course.findById(req.params.courseId).populate("instructor", "name avatar");

    if (!course) return res.status(404).render("public/page-404");

    const user = await User.findById(userId);
    const enrollment = user.enrolledCourses.find(
      (e) => e.course.toString() === course._id.toString()
    );

    if (!enrollment) return res.redirect(`/courses/${course._id}`);

    const completedLessons = enrollment.completedLessons.map((id) => id.toString());

    // flatten all lessons to find which to open
    const allLessons = course.sections.flatMap((s) => s.lessons);
    const totalLessons = allLessons.length;

    // open the requested lesson or the first incomplete one or the first lesson
    let activeLessonId = req.query.lesson || null;
    if (!activeLessonId) {
      const firstIncomplete = allLessons.find((l) => !completedLessons.includes(l._id.toString()));
      activeLessonId = (firstIncomplete || allLessons[0])?._id?.toString() || null;
    }

    res.render("student/course-content", {
      course,
      enrollment,
      completedLessons,
      activeLessonId,
      totalLessons,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("public/page-404");
  }
});

// ── MARK LESSON COMPLETE ──
router.post("/course/:courseId/lesson/:lessonId/complete", async (req, res) => {
  try {
    const userId = req.session.userId;
    const { courseId, lessonId } = req.params;

    const user = await User.findById(userId);
    const enrollment = user.enrolledCourses.find(
      (e) => e.course.toString() === courseId
    );

    if (!enrollment) return res.status(403).json({ error: "Not enrolled" });

    // add lesson if not already completed
    const alreadyDone = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId
    );

    if (!alreadyDone) {
      enrollment.completedLessons.push(lessonId);
    }

    // recalculate progress
    const course = await Course.findById(courseId);
    const totalLessons = course.sections.flatMap((s) => s.lessons).length;
    enrollment.progress = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    // if 100% move to completedCourses
    if (enrollment.progress === 100) {
      const alreadyCompleted = user.completedCourses.some(
        (c) => c.course.toString() === courseId
      );
      if (!alreadyCompleted) {
        user.completedCourses.push({ course: courseId });
      }
    }

    await user.save();

    res.json({
      success: true,
      progress: enrollment.progress,
      completedCount: enrollment.completedLessons.length,
      totalLessons,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/profile", async (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");

  const user = await User.findById(req.session.userId).populate("completedCourses.course");

  res.render("shared/profile", {
    user,
    completedCourses: user.completedCourses || [],
    certificates: user.certificates || [],
  });
});

router.get("/edit-profile", async (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");

  const user = await User.findById(req.session.userId);
  res.render("shared/edit-profile", { user });
});

router.post("/edit-profile", async (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");

  const { name, fullname, username, email, bio, location, avatar } = req.body;

  await User.findByIdAndUpdate(req.session.userId, {
    name: name || fullname,
    fullname,
    username,
    email,
    bio,
    location,
    avatar,
    lastActive: new Date(),
  });

  res.redirect("/student/profile");
});

module.exports = router;
