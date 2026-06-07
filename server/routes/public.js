const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const Challenge = require('../models/challenges');
const { requireLoginPage } = require("../middleware/authMiddleware");
const { uploadInstructorVerification } = require("../middleware/uploadMiddleware");


// Allowed values for the experience dropdown (must match become-instructor.ejs)
const EXPERIENCE_VALUES = ['1-2', '3-5', '5-10', '10+'];

// Server-side validation for step 1 (matches become-instructor.js)
function validateStep1(body) {
   const { fullName, jobTitle, expertise, experience, bio, categories } = body;
  if (!fullName?.trim() || !jobTitle?.trim() || !expertise?.trim()) {
    return 'Please fill in all required fields.';
  }
  if (!experience || !EXPERIENCE_VALUES.includes(experience)) {
    return 'Please select your years of experience.';
  }
  if (!bio?.trim() || bio.trim().length < 20) {
    return 'Please add a professional bio (at least 20 characters).';
  }
  if (!categories?.trim()) {
    return 'Please select at least one teaching category.';
  }
  return null; // OK
}

// Public pages
router.get('/', async (req, res, next) => {
  try {
    const [courses, challenges, studentCount, courseCount, certifiedCount, enrolledCount, completedCount] = await Promise.all([
      Course.find({ isPublished: true, approvalStatus: "approved" })
        .populate("instructor", "name")
        .limit(3),
      Challenge.find({ isPublished: true, deletedAt: null })
        .sort({ points: -1 })
        .limit(4)
        .select("title difficulty points"),
      User.countDocuments({ role: "student" }),
      Course.countDocuments({ isPublished: true, approvalStatus: "approved" }),
      // Students who earned at least one certificate
      User.countDocuments({ role: "student", "certificates.0": { $exists: true } }),
      // Students enrolled in at least one course
      User.countDocuments({ role: "student", "enrolledCourses.0": { $exists: true } }),
      // Students who completed at least one course
      User.countDocuments({ role: "student", "completedCourses.0": { $exists: true } })
    ]);

    // Format a number into a compact display string  e.g. 1500 → "1.5K+"
    function fmtStat(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
      if (n >= 1000)    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
      return n + '+';
    }

    // Success rate = % of enrolled students who completed at least one course
    const successRate = enrolledCount > 0
      ? Math.round((completedCount / enrolledCount) * 100)
      : 0;

    const stats = {
      learners:    fmtStat(studentCount),
      courses:     fmtStat(courseCount),
      certified:   fmtStat(certifiedCount),
      successRate: successRate + '%'
    };

    res.render('public/index', { courses, challenges, stats });
  } catch (err) {
    next(err);
  }
});
router.get('/home', (req, res, next) => {
  try {
    res.render('public/home');
  } catch (err) {
    next(err);
  }
});
router.get('/error-page', (req, res, next) => {
  try {
    res.render("public/error-page", {
      statusCode: 404,
      errorTitle: "Page Not Found",
      message: "The page you are looking for does not exist."
    });
  } catch (err) {
    next(err);
  }
});




// Instructor application — step 1 & 2 = session only; step 3 = create user + pending

router.get('/become-instructor', requireLoginPage, (req, res, next) => {
  try {
    res.render('instructor/become-instructor', {
      formError: null,
      formData: {}
    });
  } catch (err) {
    next(err);
  }
});

router.post('/become-instructor', requireLoginPage, async (req, res, next) => {
  try {
    console.log("BIO RECEIVED:", req.body.bio, "LENGTH:", req.body.bio?.trim().length);
    const error = validateStep1(req.body);
    if (error) {
      return res.render('instructor/become-instructor', {
        formError: error,
        formData: req.body
      });
    }


       req.session.instructorApplication = {
      fullName: req.body.fullName.trim(),
      jobTitle: req.body.jobTitle.trim(),
      expertise: req.body.expertise.trim(),
      experience: req.body.experience,
      bio: req.body.bio.trim(),
      categories: req.body.categories
    };

    res.redirect('/become-instructor/step2');
  } catch (err) {
  console.error(err);
  res.render('instructor/become-instructor', {
    formError: 'Something went wrong. Please try again.',
    formData: req.body
  });
}
});

router.get('/become-instructor/step2', requireLoginPage, (req, res, next) => {
  try {
    if (!req.session.instructorApplication?.fullName) {
      return res.redirect('/become-instructor');
    }
    res.render('instructor/become-instructor2', {
      user: req.session.user,
      verification: req.session.instructorApplication || {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');

  }
});

router.post('/become-instructor/step2', requireLoginPage, uploadInstructorVerification, async (req, res, next) => {
  try {
    if (!req.session.instructorApplication?.fullName) {
      return res.redirect('/become-instructor');
    }
    if (!req.files?.cv?.[0] || !req.files?.certificate?.[0]) {
      return res.status(400).render("public/error-page", {
        statusCode: 400,
        errorTitle: "Missing Documents",
        message: "CV and certificate are required."
      });
    }

    const { linkedinUrl, portfolioUrl, websiteUrl } = req.body;

const cvUrl = req.files.cv[0].path;
const certificateUrls = req.files.certificates 
  ? req.files.certificates.map(file => file.path) 
  : [];

req.session.instructorApplication = {
  ...req.session.instructorApplication,
  linkedinUrl: linkedinUrl || '',
  portfolioUrl: portfolioUrl || '',
  websiteUrl: websiteUrl || '',
  cvUrl,
 certificateUrls
};

    res.redirect('/become-instructor/step3');
  } catch (err) {
    console.error(err);
    res.status(500).render("public/error-page", {
  statusCode: 500,
  errorTitle: "Internal Server Error",
  message: "Something went wrong on our side."
});
  }
});

router.get('/become-instructor/step3',requireLoginPage, (req, res, next) => {
  try {
   
    const application = req.session.instructorApplication;

    if (!application?.fullName) return res.redirect('/become-instructor');
    if (!application.cvUrl) return res.redirect('/become-instructor/step2');

    res.render('instructor/become-instructor3', {
      application,
      verification: {
        cvUrl: application.cvUrl,
        certificateUrl: application.certificateUrl,
        linkedinUrl: application.linkedinUrl || '',
        portfolioUrl: application.portfolioUrl || '',
        websiteUrl: application.websiteUrl || ''
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/become-instructor/step3', requireLoginPage, async (req, res) => {
  try {
  
    const app = req.session.instructorApplication;
    if(!app?.fullName || !app.cvUrl) {
      return res.redirect('/become-instructor');
    }

    if (req.body.agreeAccurate !== 'on' || req.body.agreePolicies !== 'on') {
      return res.status(400).render("public/error-page", {
        statusCode: 400,
        errorTitle: "Agreement Required",
        message: "You must accept both agreements."
      });
    }

        // User is already logged in
    await User.findByIdAndUpdate(req.session.userId, {
      bio: app.bio,
      instructorVerification: {
        jobTitle: app.jobTitle,
        expertise: app.expertise,
        experience: app.experience,
        categories: app.categories,
        cvUrl: app.cvUrl,
        certificateUrl: app.certificateUrl,
        linkedinUrl: app.linkedinUrl,
        portfolioUrl: app.portfolioUrl,
        websiteUrl: app.websiteUrl,
        status: 'pending',
        submittedAt: new Date()
      },
      instructorStatus: 'pending'
    });
    delete req.session.instructorApplication;

    res.render('instructor/application-submitted');
  } catch (err) {
    console.error(err);
    res.status(500).render("public/error-page", {
  statusCode: 500,
  errorTitle: "Internal Server Error",
  message: "Something went wrong on our side."
});
  }
});
router.get('/instructor-terms', (req, res) => {
  res.render('public/instructor-terms', {
    user: req.session.user || null
  });
});

module.exports = router;
