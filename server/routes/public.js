const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const multer = require("multer");
const bcrypt = require("bcryptjs");
const upload = multer({ dest: "uploads/instructor-verification/" });

// Allowed values for the experience dropdown (must match become-instructor.ejs)
const EXPERIENCE_VALUES = ['1-2', '3-5', '5-10', '10+'];

// Server-side validation for step 1 (matches become-instructor.js)
function validateStep1(body) {
  const { fullName, jobTitle, expertise, experience, bio, categories, email, password } = body;
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
  const emailNorm = email?.trim().toLowerCase();
  if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return 'A valid email is required.';
  }
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null; // OK
}

// Public pages
router.get('/', async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("instructor", "name")
      .limit(3);

    res.render('public/index', { courses });
  } catch (err) {
    next(err);
  }
});
router.get('/home', (req, res) => res.render('public/home'));
router.get('/page-404', (req, res) => res.render('public/page-404'));




// Instructor application — step 1 & 2 = session only; step 3 = create user + pending

router.get('/become-instructor', (req, res) => {
  res.render('instructor/become-instructor', {
    formError: null,
    formData: {}
  });
});

router.post('/become-instructor', async (req, res) => {
  try {
    const error = validateStep1(req.body);
    if (error) {
      return res.render('instructor/become-instructor', {
        formError: error,
        formData: req.body
      });
    }

    const email = req.body.email.trim().toLowerCase();
    const exists = await User.findOne({ email });
    if (exists) {
      return res.render('instructor/become-instructor', {
        formError: 'An account with this email already exists. Please log in.',
        formData: req.body
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    req.session.instructorApplication = {
      fullName: req.body.fullName.trim(),
      jobTitle: req.body.jobTitle.trim(),
      expertise: req.body.expertise.trim(),
      experience: req.body.experience,
      bio: req.body.bio.trim(),
      categories: req.body.categories,
      email,
      passwordHash
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

router.get('/become-instructor/step2', (req, res) => {
  if (!req.session.instructorApplication?.fullName) {
    return res.redirect('/become-instructor');
  }
  res.render('instructor/become-instructor2');
});

router.post('/become-instructor/step2', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.session.instructorApplication?.fullName) {
      return res.redirect('/become-instructor');
    }
    if (!req.files?.cv?.[0] || !req.files?.certificate?.[0]) {
      return res.status(400).send('CV and certificate are required.');
    }

    const { linkedinUrl, portfolioUrl, websiteUrl } = req.body;
    req.session.instructorApplication = {
      ...req.session.instructorApplication,
      linkedinUrl: linkedinUrl || '',
      portfolioUrl: portfolioUrl || '',
      websiteUrl: websiteUrl || '',
      cvUrl: req.files.cv[0].path,
      certificateUrl: req.files.certificate[0].path
    };

    res.redirect('/become-instructor/step3');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/become-instructor/step3', (req, res) => {
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
});

router.post('/become-instructor/step3', async (req, res) => {
  try {
    const app = req.session.instructorApplication;
    if (!app?.fullName || !app.cvUrl || !app.passwordHash) {
      return res.redirect('/become-instructor');
    }

    if (req.body.agreeAccurate !== 'on' || req.body.agreePolicies !== 'on') {
      return res.status(400).send('You must accept both agreements.');
    }

    const exists = await User.findOne({ email: app.email });
    if (exists) {
      return res.redirect('/auth/login');
    }

    const user = await User.create({
      name: app.fullName,
      email: app.email,
      password: app.passwordHash,
      bio: app.bio,
      role: 'student',
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
      }
    });

    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    delete req.session.instructorApplication;

    res.render('instructor/application-submitted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
