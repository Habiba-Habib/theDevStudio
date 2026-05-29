const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const multer = require("multer");
const upload = multer({ dest: "uploads/instructor-verification/" });

// Public pages
router.get('/', async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true }).limit(3);

    res.render('public/index', { courses });
  } catch (err) {
    next(err);
  }
});
router.get('/home', (req, res) => res.render('public/home'));
router.get('/page-404', (req, res) => res.render('public/page-404'));




// Instructor public pages
router.get('/become-instructor', (req, res) => res.render('instructor/become-instructor'));
router.post('/become-instructor', (req, res) => {
  req.session.instructorApplication = {
    ...req.session.instructorApplication,
    ...req.body
  };

  res.redirect('/become-instructor/step2');
});
router.get('/become-instructor/step2', (req, res) => res.render('instructor/become-instructor2'));
router.get('/become-instructor/step3', (req, res) => res.render('instructor/become-instructor3'));

router.post('/become-instructor/step2', upload.fields([
  { name: "cv", maxCount: 1 },
  { name: "certificate", maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { linkedinUrl, portfolioUrl, websiteUrl } = req.body;
    
    const step1Data = req.session.instructorApplication || {};

    await User.findByIdAndUpdate(req.session.userId, {
      name: step1Data.name || req.session.user?.name || "",
      bio: step1Data.bio || "",
      
      instructorVerification: {
        cvUrl: req.files?.cv?.[0]?.path || "",
        certificateUrl: req.files?.certificate?.[0]?.path || "",
        linkedinUrl,
        portfolioUrl,
        websiteUrl,
        status: "pending",
        submittedAt: new Date()
      }
    });

    res.redirect('/become-instructor/step3');
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
module.exports = router;