const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

router.get('/all-courses', async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true });
    res.render('guest/all-courses', { courses });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    res.render('guest/course-description', { course });
  } catch (err) {
    next(err);
  }
});

module.exports = router;