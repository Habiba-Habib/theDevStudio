const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');

router.get('/all-courses', async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("instructor", "name");
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

    const userId = req.session.userId || req.session.user?._id;
    let isEnrolled = false;
    let progress = 0;

    if (userId) {
      const inCourseRoster = course.students.some(
        (studentId) => studentId.toString() === userId.toString()
      );

      const user = await User.findById(userId).select('enrolledCourses');
      const enrollment = user?.enrolledCourses?.find(
        (entry) => entry.course?.toString() === course._id.toString()
      );

      isEnrolled = inCourseRoster || Boolean(enrollment);
      progress = enrollment?.progress ?? 0;
    }

    res.render('guest/course-description', { course, isEnrolled, progress });
  } catch (err) {
    next(err);
  }
});


module.exports = router;
