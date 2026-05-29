const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const multer = require("multer");
const bcrypt = require("bcryptjs");
const upload = multer({ dest: "uploads/instructor-verification/" });

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




// Instructor public pages
router.get('/become-instructor', (req, res) => {
  res.render('instructor/become-instructor', {
    formError: null,
    formData: {}
  });
});
router.post('/become-instructor', async (req, res) => {
  try {
    const {
      fullName, jobTitle, expertise, experience, bio, categories,
      email, password
    } = req.body;

        if (!fullName || !email || !password) {
      return res.render('instructor/become-instructor', {
        formError: 'Please fill in all required fields.',
        formData: req.body
      });
    }

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.render('instructor/become-instructor', {
        formError: 'An account with this email already exists. Please log in.',
        formData: req.body
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: fullName,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      bio: bio || '',
      role: 'student',
      instructorVerification: {
        jobTitle: jobTitle || '',
        expertise: expertise || '',
        experience: experience || '',
        categories: categories || '',
        status: 'not_submitted'
      }
    });

    req.session.userId = user._id;
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    req.session.instructorApplication = { ...req.body };

    res.redirect('/become-instructor/step2');
  } catch (err) {
    console.error(err);
        res.render('instructor/become-instructor', {
      formError: 'Something went wrong. Please try again.',
      formData: req.body
    });
  }
});
router.get('/become-instructor/step2', (req, res) => res.render('instructor/become-instructor2'));
router.get('/become-instructor/step3', (req, res) => {
  const application = req.session.instructorApplication || {};

  res.render('instructor/become-instructor3', {
    user: null,
    application,
    verification: {
      cvUrl: application.cvUrl || '',
      certificateUrl: application.certificateUrl || '',
      linkedinUrl: application.linkedinUrl || '',
      portfolioUrl: application.portfolioUrl || '',
      websiteUrl: application.websiteUrl || ''
    }
  });
});
router.post('/become-instructor/step3', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/become-instructor');
    }

    await User.findByIdAndUpdate(req.session.userId, {
      'instructorVerification.status': 'pending',
      'instructorVerification.submittedAt': new Date()
    });

    delete req.session.instructorApplication;

    res.render('instructor/application-submitted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
router.post('/become-instructor/step2', upload.fields([
  { name: "cv", maxCount: 1 },
  { name: "certificate", maxCount: 1 }
]), async (req, res) => {
  try {
        if (!req.session.userId) {
      return res.redirect('/become-instructor');
    }

    const step1Data = req.session.instructorApplication || {};
    const { linkedinUrl, portfolioUrl, websiteUrl } = req.body;
    await User.findByIdAndUpdate(req.session.userId, {
      instructorVerification: {
        jobTitle: step1Data.jobTitle || '',
        expertise: step1Data.expertise || '',
        experience: step1Data.experience || '',
        categories: step1Data.categories || '',
        cvUrl: req.files?.cv?.[0]?.path || '',
        certificateUrl: req.files?.certificate?.[0]?.path || '',
        linkedinUrl: linkedinUrl || '',
        portfolioUrl: portfolioUrl || '',
        websiteUrl: websiteUrl || '',
        status: 'pending',
        submittedAt: new Date()
      }
    });
        req.session.instructorApplication = {
      ...step1Data,
      linkedinUrl: linkedinUrl || '',
      portfolioUrl: portfolioUrl || '',
      websiteUrl: websiteUrl || '',
      cvUrl: req.files?.cv?.[0]?.path || '',
      certificateUrl: req.files?.certificate?.[0]?.path || ''
    };
    res.redirect('/become-instructor/step3');
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
module.exports = router;
