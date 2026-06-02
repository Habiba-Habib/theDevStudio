const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');

router.get('/all-courses', async (req, res, next) => {
  try {
    const userId = req.session.userId || req.session.user?._id || null;

    let enrolledCourseIds = new Set();
    if (userId) {
      const user = await User.findById(userId).select('enrolledCourses');
      (user?.enrolledCourses || []).forEach(e => {
        if (e.course) enrolledCourseIds.add(e.course.toString());
      });
    }

    const courses = await Course.find({ isPublished: true })
      .populate("instructor", "name");

    const coursesWithStatus = courses.map(course => {
      const isEnrolled =
        enrolledCourseIds.has(course._id.toString()) ||
        (userId && course.students.some(s => s.toString() === userId.toString()));

      return {
        ...course.toObject(),
        isEnrolled
      };
    });

    res.render('guest/all-courses', {
      courses: coursesWithStatus,
      currentUserId: userId
    });
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
      .populate("instructor", "name avatar")
      .populate("reviews.user", "name avatar");

    if (!course) {
      return res.status(404).render('public/page-404');
    }

    const userId = req.session.userId || req.session.user?._id;
    let isEnrolled = false;
    let progress = 0;
    let isOwner = false;

    if (userId) {
      const inCourseRoster = course.students.some(
        s => s.toString() === userId.toString()
      );
      const user = await User.findById(userId).select('enrolledCourses');
      const enrollment = user?.enrolledCourses?.find(
        e => e.course?.toString() === course._id.toString()
      );
      isEnrolled = inCourseRoster || Boolean(enrollment);
      progress = enrollment?.progress ?? 0;
    isOwner = course.instructor?._id?.toString() === userId.toString();
    }

    res.render('guest/course-description', { course, isEnrolled, progress, isOwner });
  } catch (err) {
    next(err);
  }
});



module.exports = router;
