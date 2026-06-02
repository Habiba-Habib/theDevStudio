const express = require('express');
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const Course = require('../models/Course');
const User = require('../models/User');
const multer = require("multer");
const { requireLoginPage } = require("../middleware/authMiddleware");
const upload = multer({ dest: "uploads/instructor-verification/" });
async function uploadInstructorDocument(file) {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "thedevstudio/instructor-verification",
    resource_type: "raw",
    use_filename: true,
    unique_filename: true
  });

  fs.unlinkSync(file.path);

  return result.secure_url;
}

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
    const courses = await Course.find({ isPublished: true })
      .populate("instructor", "name")
      .limit(3);

    res.render('public/index', { courses });
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
router.get('/page-404', (req, res, next) => {
  try {
    res.render('public/page-404');
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

    res.render('instructor/become-instructor2');
  } catch (err) {
    next(err);
  }
});

router.post('/become-instructor/step2',requireLoginPage, upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res, next) => {
  try {
    if (!req.session.instructorApplication?.fullName) {
      return res.redirect('/become-instructor');
    }
    if (!req.files?.cv?.[0] || !req.files?.certificate?.[0]) {
      return res.status(400).send('CV and certificate are required.');
    }

    const { linkedinUrl, portfolioUrl, websiteUrl } = req.body;

const cvUrl = await uploadInstructorDocument(req.files.cv[0]);
const certificateUrl = await uploadInstructorDocument(req.files.certificate[0]);

req.session.instructorApplication = {
  ...req.session.instructorApplication,
  linkedinUrl: linkedinUrl || '',
  portfolioUrl: portfolioUrl || '',
  websiteUrl: websiteUrl || '',
  cvUrl,
  certificateUrl
};

    res.redirect('/become-instructor/step3');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
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
      return res.status(400).send('You must accept both agreements.');
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
    res.status(500).send('Server error');
  }
});

module.exports = router;
