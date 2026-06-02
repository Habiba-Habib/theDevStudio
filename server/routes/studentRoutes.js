const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const User    = require("../models/User");
const Course  = require("../models/Course");
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

// ── RESOURCE DOWNLOAD PROXY ──
// Streams file from Cloudinary through server using authenticated API endpoint
router.get("/course/:courseId/lesson/:lessonId/download-resource", async (req, res) => {
  try {
    const userId   = req.session.userId;
    const { courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).send("Course not found");

    // verify the user is enrolled or is the instructor owner
    const user = await User.findById(userId);
    const isEnrolled        = user.enrolledCourses.some(e => e.course.toString() === courseId);
    const isInstructorOwner = course.instructor?.toString() === userId.toString();
    if (!isEnrolled && !isInstructorOwner) return res.status(403).send("Access denied");

    const lesson = course.sections.flatMap(s => s.lessons).find(l => l._id.toString() === lessonId);
    if (!lesson || !lesson.resourceFile) return res.status(404).send("Resource not found");

    const fileUrl  = lesson.resourceFile;

    // Extract and decode the public_id from the stored Cloudinary URL
    const urlMatch = fileUrl.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
    if (!urlMatch) return res.status(500).send("Invalid resource URL");

    const publicId   = decodeURIComponent(urlMatch[1]);
    const cloudinary = require('../config/cloudinary');
    const unzipper   = require('unzipper');
    const https      = require('https');

    // The only authenticated endpoint that works with restricted delivery accounts
    const downloadUrl = cloudinary.utils.download_zip_url({
      public_ids: [publicId],
      resource_type: 'raw'
    });

    const originalName = publicId.split('/').pop();

    // Fetch the zip into memory
    https.get(downloadUrl, (fileRes) => {
      if (fileRes.statusCode !== 200) {
        console.error('Cloudinary archive fetch failed:', fileRes.statusCode);
        return res.status(502).send("Failed to fetch resource from storage");
      }

      const chunks = [];
      fileRes.on('data', chunk => chunks.push(chunk));
      fileRes.on('error', err => {
        console.error('Fetch stream error:', err);
        if (!res.headersSent) res.status(500).send("Download failed");
      });
      fileRes.on('end', async () => {
        try {
          const buf = Buffer.concat(chunks);
          const dir = await unzipper.Open.buffer(buf);

          if (!dir.files.length) return res.status(500).send("Empty archive");

          const fileContent = await dir.files[0].buffer();

          const ext         = originalName.split('.').pop().toLowerCase();
          const mimeMap     = {
            pdf:  'application/pdf',
            doc:  'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ppt:  'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            xls:  'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          };
          const contentType = mimeMap[ext] || 'application/octet-stream';

          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);
          res.setHeader('Content-Length', fileContent.length);
          res.send(fileContent);

        } catch (err) {
          console.error('Unzip error:', err);
          if (!res.headersSent) res.status(500).send("Failed to extract file");
        }
      });

    }).on('error', (err) => {
      console.error('HTTPS request error:', err);
      if (!res.headersSent) res.status(500).send("Download failed");
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/dashboard", studentController.getDashboard);
router.get("/leaderboard", studentController.getLeaderboard);
router.get("/payment/:courseId", studentController.getPaymentPage);
router.get("/my-courses", studentController.getMyCourses);
router.get("/start-challenge/:id", studentController.getStartChallenge);
router.post("/payment/:courseId", studentController.processPayment);
router.post("/activate-instructor", studentController.activateInstructorAccount);
router.post("/challenge/:id/run",    studentController.runCode);
router.post("/challenge/:id/submit", studentController.submitChallenge);
router.get("/challenge/:id/review",  studentController.getChallengeReview);

// ── COURSE PLAYER (INSTRUCTOR PREVIEW BYPASS) ──
router.get("/course/:courseId/learn", async (req, res) => {
  try {
    const userId = req.session.userId;
    const course = await Course.findById(req.params.courseId).populate("instructor", "name avatar");

    if (!course) return res.status(404).render("public/page-404");

    const user = await User.findById(userId);
    let enrollment = user.enrolledCourses.find(
      (e) => e.course.toString() === course._id.toString()
    );

    const isInstructorOwner = course.instructor?._id?.toString() === userId.toString();

    // Block access only if they are not enrolled AND not the instructor who owns the course
    if (!enrollment && !isInstructorOwner) {
      return res.redirect(`/courses/${course._id}`);
    }

    // Mock enrollment for the course instructor owner so they can preview the portal
    if (!enrollment && isInstructorOwner) {
      enrollment = {
        progress: 100,
        completedLessons: []
      };
    }

    const completedLessons = (enrollment.completedLessons || []).map((id) => id.toString());

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
  res.render("shared/edit-profile", { user, errors: [] });
});

router.post("/edit-profile", async (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");

  const { name, username, email, bio, location, avatar,
          currentPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect("/auth/login");

  const updateData = {
    name:       name || user.name,
    username:   username || user.username,
    email:      email || user.email,
    bio,
    location,
    avatar:     (avatar || '').replace(/^.*\//, ''), // keep filename only
    lastActive: new Date(),
  };

  // ── password change ──
  if (currentPassword || newPassword || confirmPassword) {
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
      req.session.userId, updateData, { new: true }
    );

    // update session so navbar reflects changes immediately
    req.session.user = {
      ...req.session.user,
      name:   updated.name,
      email:  updated.email,
      avatar: updated.avatar,
      role:   updated.role,
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

// ── SUBMIT COURSE REVIEW ──
router.post("/course/:courseId/review", async (req, res) => {
  try {
    const userId   = req.session.userId;
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    const stars = parseInt(rating, 10);
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Invalid rating" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(e => e.course.toString() === courseId);
    if (!isEnrolled) return res.status(403).json({ error: "Not enrolled" });

    // Replace existing review from the same user or add new one
    const existingIndex = course.reviews.findIndex(r => r.user.toString() === userId.toString());
    if (existingIndex > -1) {
      course.reviews[existingIndex].rating  = stars;
      course.reviews[existingIndex].comment = comment || '';
      course.reviews[existingIndex].date    = new Date();
    } else {
      course.reviews.push({ user: userId, rating: stars, comment: comment || '' });
    }

    // Recalculate average rating
    const total = course.reviews.reduce((sum, r) => sum + r.rating, 0);
    course.rating = Math.round((total / course.reviews.length) * 10) / 10;

    await course.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
