const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

router.get('/all-courses', async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true });
    res.render('courses/all-courses', { courses });
  } catch (err) {
    next(err);
  }
});

router.get('/course/:id', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    res.render('courses/course-description', { course });
  } catch (err) {
    next(err);
  }
});

module.exports = router;