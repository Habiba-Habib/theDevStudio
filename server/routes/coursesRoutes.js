const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const mongoose = require('mongoose');

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).render('public/page-404');
    }

    const course = await Course.findById(req.params.id)
    .populate("instructor", "name avatar");

    if (!course) {
      return res.status(404).render('public/page-404');
    }

    res.render('guest/course-description', { course });
  } catch (err) {
    next(err);
  }
});


module.exports = router;