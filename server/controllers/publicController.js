const Course     = require("../models/Course");
const User       = require("../models/User");
const Challenge  = require("../models/challenges");

/* ════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════ */

const EXPERIENCE_VALUES = ["1-2", "3-5", "5-10", "10+"];

function fmtStat(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M+";
  if (n >= 1000)    return (n / 1000).toFixed(1).replace(/\.0$/, "")    + "K+";
  return n + "+";
}

function validateStep1(body) {
  const { fullName, jobTitle, expertise, experience, bio, categories } = body;
  if (!fullName?.trim() || !jobTitle?.trim() || !expertise?.trim()) {
    return "Please fill in all required fields.";
  }
  if (!experience || !EXPERIENCE_VALUES.includes(experience)) {
    return "Please select your years of experience.";
  }
  if (!bio?.trim() || bio.trim().length < 20) {
    return "Please add a professional bio (at least 20 characters).";
  }
  if (!categories?.trim()) {
    return "Please select at least one teaching category.";
  }
  return null;
}

/* ════════════════════════════════════════════
   HOME PAGE
   ════════════════════════════════════════════ */

// GET /
exports.getHomePage = async (req, res, next) => {
  try {
    const [
      courses, challenges,
      studentCount, courseCount, certifiedCount,
      enrolledCount, completedCount
    ] = await Promise.all([
      Course.find({ isPublished: true, approvalStatus: "approved" })
        .populate("instructor", "name")
        .limit(3),
      Challenge.find({ isPublished: true, deletedAt: null })
        .sort({ points: -1 })
        .limit(4)
        .select("title difficulty points"),
      User.countDocuments({ role: "student" }),
      Course.countDocuments({ isPublished: true, approvalStatus: "approved" }),
      User.countDocuments({ role: "student", "certificates.0":    { $exists: true } }),
      User.countDocuments({ role: "student", "enrolledCourses.0": { $exists: true } }),
      User.countDocuments({ role: "student", "completedCourses.0":{ $exists: true } })
    ]);

    const successRate = enrolledCount > 0
      ? Math.round((completedCount / enrolledCount) * 100)
      : 0;

    const stats = {
      learners:    fmtStat(studentCount),
      courses:     fmtStat(courseCount),
      certified:   fmtStat(certifiedCount),
      successRate: successRate + "%"
    };

    res.render("public/index", { courses, challenges, stats });
  } catch (err) {
    next(err);
  }
};

/* ════════════════════════════════════════════
   BECOME INSTRUCTOR — STEP 1
   ════════════════════════════════════════════ */

// GET /become-instructor
exports.getBecomeInstructor = (req, res) => {
  res.render("instructor/become-instructor", { formError: null, formData: {} });
};

// POST /become-instructor
exports.postBecomeInstructor = (req, res) => {
  try {
    const error = validateStep1(req.body);
    if (error) {
      return res.render("instructor/become-instructor", {
        formError: error,
        formData:  req.body
      });
    }

    req.session.instructorApplication = {
      fullName:   req.body.fullName.trim(),
      jobTitle:   req.body.jobTitle.trim(),
      expertise:  req.body.expertise.trim(),
      experience: req.body.experience,
      bio:        req.body.bio.trim(),
      categories: req.body.categories
    };

    res.redirect("/become-instructor/step2");
  } catch (err) {
    console.error(err);
    res.render("instructor/become-instructor", {
      formError: "Something went wrong. Please try again.",
      formData:  req.body
    });
  }
};

/* ════════════════════════════════════════════
   BECOME INSTRUCTOR — STEP 2
   ════════════════════════════════════════════ */

// GET /become-instructor/step2
exports.getBecomeInstructorStep2 = (req, res) => {
  if (!req.session.instructorApplication?.fullName) {
    return res.redirect("/become-instructor");
  }
  res.render("instructor/become-instructor2", {
    user:         req.session.user,
    verification: req.session.instructorApplication || {}
  });
};

// POST /become-instructor/step2
exports.postBecomeInstructorStep2 = async (req, res) => {
  try {
    if (!req.session.instructorApplication?.fullName) {
      return res.redirect("/become-instructor");
    }
    if (!req.files?.cv?.[0] || !req.files?.certificates?.[0]) {
      return res.status(400).render("public/error-page", {
        statusCode: 400,
        errorTitle: "Missing Documents",
        message: "CV and certificate are required."
      });
    }

    const { linkedinUrl, portfolioUrl, websiteUrl } = req.body;

    req.session.instructorApplication = {
      ...req.session.instructorApplication,
      linkedinUrl:     linkedinUrl  || "",
      portfolioUrl:    portfolioUrl || "",
      websiteUrl:      websiteUrl   || "",
      cvUrl:           req.files.cv[0].path,
      certificateUrls: req.files.certificates
        ? req.files.certificates.map(f => f.path)
        : []
    };

    res.redirect("/become-instructor/step3");
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
   BECOME INSTRUCTOR — STEP 3
   ════════════════════════════════════════════ */

// GET /become-instructor/step3
exports.getBecomeInstructorStep3 = (req, res) => {
  const application = req.session.instructorApplication;
  if (!application?.fullName) return res.redirect("/become-instructor");
  if (!application.cvUrl)     return res.redirect("/become-instructor/step2");

  res.render("instructor/become-instructor3", {
    application,
    verification: {
      cvUrl:           application.cvUrl,
      certificateUrls: application.certificateUrls,
      linkedinUrl:     application.linkedinUrl  || "",
      portfolioUrl:    application.portfolioUrl || "",
      websiteUrl:      application.websiteUrl   || ""
    }
  });
};

// POST /become-instructor/step3
exports.postBecomeInstructorStep3 = async (req, res) => {
  try {
    const app = req.session.instructorApplication;
    if (!app?.fullName || !app.cvUrl) {
      return res.redirect("/become-instructor");
    }

    if (req.body.agreeAccurate !== "on" || req.body.agreePolicies !== "on") {
      return res.status(400).render("public/error-page", {
        statusCode: 400,
        errorTitle: "Agreement Required",
        message: "You must accept both agreements."
      });
    }

    await User.findByIdAndUpdate(req.session.userId, {
      bio: app.bio,
      instructorVerification: {
        jobTitle:        app.jobTitle,
        expertise:       app.expertise,
        experience:      app.experience,
        categories:      app.categories,
        cvUrl:           app.cvUrl,
        certificateUrls: app.certificateUrls || [],
        linkedinUrl:     app.linkedinUrl,
        portfolioUrl:    app.portfolioUrl,
        websiteUrl:      app.websiteUrl,
        status:          "pending",
        submittedAt:     new Date()
      },
      instructorStatus: "pending"
    });

    delete req.session.instructorApplication;
    res.render("instructor/application-submitted");
  } catch (err) {
    console.error(err);
    res.status(500).render("public/error-page", {
      statusCode: 500,
      errorTitle: "Internal Server Error",
      message: "Something went wrong on our side."
    });
  }
};
