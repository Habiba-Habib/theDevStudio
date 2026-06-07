const Course    = require("../models/Course");
const User      = require("../models/User");
const mongoose  = require("mongoose");

/* ════════════════════════════════════════════
   PRIVATE HELPERS
   ════════════════════════════════════════════ */

function buildCertificateId(userId, courseId) {
  return `TDS-${courseId.toString().slice(-6).toUpperCase()}-${userId.toString().slice(-6).toUpperCase()}`;
}

function ensureCertificate(user, courseId) {
  const existing = user.certificates.find(
    (cert) => cert.course?.toString() === courseId.toString()
  );

  if (existing) {
    if (!existing.certificateId) {
      existing.certificateId = buildCertificateId(user._id, courseId);
    }
    return existing;
  }

  const certificate = {
    course: courseId,
    certificateId: buildCertificateId(user._id, courseId),
    issuedAt: new Date()
  };

  user.certificates.push(certificate);
  return certificate;
}

/* ════════════════════════════════════════════
   PUBLIC COURSE PAGES  (no login required)
   ════════════════════════════════════════════ */

// GET /courses/all-courses
exports.getAllCourses = async (req, res, next) => {
  try {
    const userId = req.session.userId || req.session.user?._id || null;

    let enrolledCourseIds = new Set();
    let userCertificates  = new Set();

    if (userId) {
      const user = await User.findById(userId).select("enrolledCourses certificates");

      (user?.enrolledCourses || []).forEach(e => {
        if (e.course) enrolledCourseIds.add(e.course.toString());
      });

      (user?.certificates || []).forEach(cert => {
        if (cert.course) userCertificates.add(cert.course.toString());
      });
    }

    const courses = await Course.find({
      isPublished:    true,
      approvalStatus: "approved"
    }).populate("instructor", "name");

    const coursesWithStatus = courses.map(course => {
      const courseObj = course.toObject();

      const isEnrolled =
        enrolledCourseIds.has(course._id.toString()) ||
        (userId && course.students.some(s => s.toString() === userId.toString()));

      const hasCertificate = userCertificates.has(course._id.toString());
      const isOwn          = userId && course.instructor?._id?.toString() === userId.toString();

      return { ...courseObj, isEnrolled, hasCertificate, isOwn };
    });

    res.render("guest/all-courses", { courses: coursesWithStatus, currentUserId: userId });
  } catch (err) {
    next(err);
  }
};

// GET /courses/:id  — course description / landing page
exports.getCourseDescription = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).render("public/error-page", {
        statusCode: 404,
        errorTitle: "Course Not Found",
        message: "This course does not exist or was removed."
      });
    }

    const course = await Course.findById(req.params.id)
      .populate("instructor", "name avatar")
      .populate("reviews.user",  "name avatar");

    if (!course) {
      return res.status(404).render("public/error-page", {
        statusCode: 404,
        errorTitle: "Course Not Found",
        message: "This course does not exist or was removed."
      });
    }

    // Hide unpublished courses from non-owners and non-admins
    if (!course.isPublished || course.approvalStatus !== "approved") {
      const userId  = req.session.userId || req.session.user?._id;
      const isOwner = userId && course.instructor?._id?.toString() === userId.toString();
      const isAdmin = req.session.role === "admin" || req.session.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(404).render("public/error-page", {
          statusCode: 404,
          errorTitle: "Course Not Found",
          message: "This course does not exist or was removed."
        });
      }
    }

    const userId = req.session.userId || req.session.user?._id;
    let isEnrolled = false;
    let progress   = 0;
    let isOwner    = false;

    if (userId) {
      const inCourseRoster = course.students.some(s => s.toString() === userId.toString());
      const user           = await User.findById(userId).select("enrolledCourses");
      const enrollment     = user?.enrolledCourses?.find(
        e => e.course?.toString() === course._id.toString()
      );
      isEnrolled = inCourseRoster || Boolean(enrollment);
      progress   = enrollment?.progress ?? 0;
      isOwner    = course.instructor?._id?.toString() === userId.toString();
    }

    res.render("guest/course-description", { course, isEnrolled, progress, isOwner });
  } catch (err) {
    next(err);
  }
};

/* ════════════════════════════════════════════
   COURSE PLAYER  (login required)
   ════════════════════════════════════════════ */

// GET /student/course/:courseId/learn
exports.getCourseContent = async (req, res) => {
  try {
    const userId = req.session.userId;
    const course = await Course.findById(req.params.courseId)
      .populate("instructor", "name avatar email");

    if (!course) {
      return res.status(404).render("public/error-page", {
        statusCode: 404,
        errorTitle: "Not Found",
        message: "The item you are looking for does not exist."
      });
    }

    const user       = await User.findById(userId);
    let   enrollment = user.enrolledCourses.find(
      (e) => e.course.toString() === course._id.toString()
    );

    const isInstructorOwner = course.instructor?._id?.toString() === userId.toString();

    // Block if not enrolled AND not the course's own instructor
    if (!enrollment && !isInstructorOwner) {
      return res.redirect(`/courses/${course._id}`);
    }

    // Give the instructor a mock enrollment so the player renders correctly
    if (!enrollment && isInstructorOwner) {
      enrollment = { progress: 100, completedLessons: [] };
    }

    const completedLessons = (enrollment.completedLessons || []).map((id) => id.toString());
    const allLessons       = course.sections.flatMap((s) => s.lessons);
    const totalLessons     = allLessons.length;

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
      isInstructorOwner,
      activeNote: (() => {
        if (!activeLessonId) return "";
        const note = (enrollment.notes || []).find(n => n.lesson.toString() === activeLessonId);
        return note ? note.content : "";
      })(),
      activeSubmission: (() => {
        if (!activeLessonId) return null;
        const lesson = allLessons.find(l => l._id.toString() === activeLessonId);
        if (!lesson) return null;
        return (lesson.assignmentSubmissions || []).find(
          s => s.student.toString() === userId.toString()
        ) || null;
      })()
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("public/error-page", {
      statusCode: 500,
      errorTitle: "Internal Server Error",
      message: "Something went wrong on our side."
    });
  }
};

/* ════════════════════════════════════════════
   LESSON INTERACTIONS
   ════════════════════════════════════════════ */

// POST /student/course/:courseId/lesson/:lessonId/complete
exports.markLessonComplete = async (req, res) => {
  try {
    const userId             = req.session.userId;
    const { courseId, lessonId } = req.params;

    const user       = await User.findById(userId);
    const enrollment = user.enrolledCourses.find(e => e.course.toString() === courseId);

    if (!enrollment) return res.status(403).json({ error: "Not enrolled" });

    const alreadyDone = enrollment.completedLessons.some(id => id.toString() === lessonId);
    if (!alreadyDone) enrollment.completedLessons.push(lessonId);

    const course      = await Course.findById(courseId);
    const totalLessons = course.sections.flatMap(s => s.lessons).length;

    enrollment.progress = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    if (enrollment.progress === 100) {
      const alreadyCompleted = user.completedCourses.some(c => c.course.toString() === courseId);
      if (!alreadyCompleted) user.completedCourses.push({ course: courseId });
      ensureCertificate(user, courseId);
    }

    await user.save();

    res.json({
      success:        true,
      progress:       enrollment.progress,
      completedCount: enrollment.completedLessons.length,
      totalLessons
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /student/course/:courseId/lesson/:lessonId/note
exports.saveLessonNote = async (req, res) => {
  try {
    const userId                 = req.session.userId;
    const { courseId, lessonId } = req.params;
    const { content }            = req.body;

    const user       = await User.findById(userId);
    const enrollment = user.enrolledCourses.find(e => e.course.toString() === courseId);
    if (!enrollment) return res.status(403).json({ error: "Not enrolled" });

    const existing = enrollment.notes.find(n => n.lesson.toString() === lessonId);
    if (existing) {
      existing.content   = content || "";
      existing.updatedAt = new Date();
    } else {
      enrollment.notes.push({ lesson: lessonId, content: content || "" });
    }

    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /student/course/:courseId/review
exports.submitReview = async (req, res) => {
  try {
    const userId             = req.session.userId;
    const { courseId }       = req.params;
    const { rating, comment} = req.body;

    const stars = parseInt(rating, 10);
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Invalid rating" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const user       = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(e => e.course.toString() === courseId);
    if (!isEnrolled) return res.status(403).json({ error: "Not enrolled" });

    const existingIndex = course.reviews.findIndex(r => r.user.toString() === userId.toString());
    if (existingIndex > -1) {
      course.reviews[existingIndex].rating  = stars;
      course.reviews[existingIndex].comment = comment || "";
      course.reviews[existingIndex].date    = new Date();
    } else {
      course.reviews.push({ user: userId, rating: stars, comment: comment || "" });
    }

    const total    = course.reviews.reduce((sum, r) => sum + r.rating, 0);
    course.rating  = Math.round((total / course.reviews.length) * 10) / 10;

    await course.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ════════════════════════════════════════════
   FILE DOWNLOADS  (resource & assignment)
   ════════════════════════════════════════════ */

// Shared helper — streams a Cloudinary raw file through the server
async function streamCloudinaryFile(res, fileUrl, errorLabel) {
  const cloudinary = require("../config/cloudinary");
  const unzipper   = require("unzipper");
  const https      = require("https");

  const urlMatch = fileUrl.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
  if (!urlMatch) {
    return res.status(500).render("public/error-page", {
      statusCode: 500,
      errorTitle: "Invalid Resource",
      message: `The ${errorLabel} file URL is invalid.`
    });
  }

  const publicId      = decodeURIComponent(urlMatch[1]);
  const originalName  = publicId.split("/").pop();
  const downloadUrl   = cloudinary.utils.download_zip_url({
    public_ids:    [publicId],
    resource_type: "raw"
  });

  https.get(downloadUrl, (fileRes) => {
    if (fileRes.statusCode !== 200) {
      return res.status(502).render("public/error-page", {
        statusCode: 502,
        errorTitle: "Download Failed",
        message: `Failed to fetch ${errorLabel} from storage.`
      });
    }

    const chunks = [];
    fileRes.on("data", chunk => chunks.push(chunk));
    fileRes.on("error", err => {
      console.error("Fetch stream error:", err);
      if (!res.headersSent) res.status(500).render("public/error-page", {
        statusCode: 500,
        errorTitle: "Download Failed",
        message: `Something went wrong while downloading this ${errorLabel}.`
      });
    });
    fileRes.on("end", async () => {
      try {
        const buf  = Buffer.concat(chunks);
        const dir  = await unzipper.Open.buffer(buf);
        if (!dir.files.length) throw new Error("Empty archive");

        const fileContent = await dir.files[0].buffer();
        const ext         = originalName.split(".").pop().toLowerCase();
        const mimeMap     = {
          pdf:  "application/pdf",
          doc:  "application/msword",
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ppt:  "application/vnd.ms-powerpoint",
          pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          xls:  "application/vnd.ms-excel",
          xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        res.setHeader("Content-Type",        mimeMap[ext] || "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(originalName)}"`);
        res.setHeader("Content-Length",      fileContent.length);
        res.send(fileContent);
      } catch (err) {
        console.error("Unzip error:", err);
        if (!res.headersSent) res.status(500).render("public/error-page", {
          statusCode: 500,
          errorTitle: "Download Failed",
          message: `Something went wrong while downloading this ${errorLabel}.`
        });
      }
    });
  }).on("error", err => {
    console.error("HTTPS request error:", err);
    if (!res.headersSent) res.status(500).render("public/error-page", {
      statusCode: 500,
      errorTitle: "Download Failed",
      message: `Something went wrong while downloading this ${errorLabel}.`
    });
  });
}

// GET /student/course/:courseId/lesson/:lessonId/download-resource
exports.downloadResource = async (req, res) => {
  try {
    const userId             = req.session.userId;
    const { courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).render("public/error-page", {
        statusCode: 404, errorTitle: "Course Not Found",
        message: "This course does not exist or was removed."
      });
    }

    const user               = await User.findById(userId);
    const isEnrolled         = user.enrolledCourses.some(e => e.course.toString() === courseId);
    const isInstructorOwner  = course.instructor?.toString() === userId.toString();
    if (!isEnrolled && !isInstructorOwner) {
      return res.status(403).render("public/error-page", {
        statusCode: 403, errorTitle: "Access Denied",
        message: "You do not have permission to access this file."
      });
    }

    const lesson = course.sections.flatMap(s => s.lessons).find(l => l._id.toString() === lessonId);
    if (!lesson || !lesson.resourceFile) {
      return res.status(404).render("public/error-page", {
        statusCode: 404, errorTitle: "Resource Not Found",
        message: "This resource does not exist or was removed."
      });
    }

    await streamCloudinaryFile(res, lesson.resourceFile, "resource");
  } catch (err) {
    console.error(err);
    res.status(500).render("public/error-page", {
      statusCode: 500, errorTitle: "Internal Server Error",
      message: "Something went wrong on our side."
    });
  }
};

// GET /student/course/:courseId/lesson/:lessonId/download-assignment
exports.downloadAssignment = async (req, res) => {
  try {
    const userId             = req.session.userId;
    const { courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).render("public/error-page", {
        statusCode: 404, errorTitle: "Course Not Found",
        message: "This course does not exist or was removed."
      });
    }

    const user               = await User.findById(userId);
    const isEnrolled         = user.enrolledCourses.some(e => e.course.toString() === courseId);
    const isInstructorOwner  = course.instructor?.toString() === userId.toString();
    if (!isEnrolled && !isInstructorOwner) {
      return res.status(403).render("public/error-page", {
        statusCode: 403, errorTitle: "Access Denied",
        message: "You do not have permission to access this assignment."
      });
    }

    const lesson = course.sections.flatMap(s => s.lessons).find(l => l._id.toString() === lessonId);
    if (!lesson || !lesson.assignmentFile) {
      return res.status(404).render("public/error-page", {
        statusCode: 404, errorTitle: "Assignment Not Found",
        message: "This assignment does not exist or was removed."
      });
    }

    await streamCloudinaryFile(res, lesson.assignmentFile, "assignment");
  } catch (err) {
    console.error(err);
    res.status(500).render("public/error-page", {
      statusCode: 500, errorTitle: "Internal Server Error",
      message: "Something went wrong on our side."
    });
  }
};

// POST /student/course/:courseId/lesson/:lessonId/submit-assignment
// (multer middleware applied in the route file)
exports.submitAssignment = async (req, res) => {
  try {
    const userId             = req.session.userId;
    const { courseId, lessonId } = req.params;

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const user       = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(e => e.course.toString() === courseId);
    if (!isEnrolled) return res.status(403).json({ error: "Not enrolled" });

    const section = course.sections.find(s => s.lessons.some(l => l._id.toString() === lessonId));
    const lesson  = section?.lessons.find(l => l._id.toString() === lessonId);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    const cloudinary = require("../config/cloudinary");
    const fileStr    = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result     = await cloudinary.uploader.upload(fileStr, {
      folder:        "thedevstudio/submissions",
      resource_type: "raw",
      public_id:     `${userId}_${lessonId}_${Date.now()}`
    });

    const submission   = {
      student:     userId,
      fileUrl:     result.secure_url,
      fileName:    req.file.originalname,
      submittedAt: new Date()
    };
    const existingIdx  = lesson.assignmentSubmissions.findIndex(
      s => s.student.toString() === userId.toString()
    );

    if (existingIdx > -1) {
      lesson.assignmentSubmissions[existingIdx] = submission;
    } else {
      lesson.assignmentSubmissions.push(submission);
    }

    await course.save();
    res.json({ success: true, fileName: req.file.originalname, submittedAt: submission.submittedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ════════════════════════════════════════════
   CERTIFICATE
   ════════════════════════════════════════════ */

// GET /student/certificate/:courseId
exports.getCertificate = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
      .populate({ path: "completedCourses.course", populate: { path: "instructor", select: "name" } })
      .populate({ path: "certificates.course",     populate: { path: "instructor", select: "name" } });

    if (!user || user.role !== "student") {
      return res.status(403).render("public/error-page", {
        statusCode: 403,
        errorTitle: "Forbidden",
        message: "You are not authorized to view this content."
      });
    }

    const completedItem = user.completedCourses.find(
      item => item.course?._id?.toString() === req.params.courseId
    );

    if (!completedItem?.course) {
      return res.status(404).render("public/error-page", {
        statusCode: 404,
        errorTitle: "Not Found",
        message: "The item you are looking for does not exist."
      });
    }

    let certificate = user.certificates.find(
      cert => cert.course?._id?.toString() === req.params.courseId
    );

    if (!certificate) {
      ensureCertificate(user, completedItem.course._id);
      await user.save();
      certificate       = user.certificates.find(
        cert => cert.course?.toString() === req.params.courseId
      );
      certificate.course = completedItem.course;
    } else if (!certificate.certificateId) {
      certificate.certificateId = buildCertificateId(user._id, completedItem.course._id);
      await user.save();
    }

    res.render("student/certificate", {
      user,
      course:      completedItem.course,
      certificate,
      completedAt: completedItem.completedAt
    });
  } catch (err) {
    console.error("certificate error:", err);
    res.status(500).render("public/error-page", {
      statusCode: 500,
      errorTitle: "Internal Server Error",
      message: "Something went wrong on our side."
    });
  }
};
