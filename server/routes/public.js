const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

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
router.get('/become-instructor/step2', (req, res) => res.render('instructor/become-instructor2'));
router.get('/become-instructor/step3', (req, res) => res.render('instructor/become-instructor3'));

module.exports = router;