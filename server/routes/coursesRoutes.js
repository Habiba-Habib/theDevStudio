const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');

router.get('/all-courses', async (req, res, next) => {
  try {
    const userId = req.session.userId || req.session.user?._id || null;

    let enrolledCourseIds = new Set();
    let userCertificates = new Set();
    
    if (userId) {
      const user = await User.findById(userId).select('enrolledCourses certificates');
      
      // Get enrolled courses
      (user?.enrolledCourses || []).forEach(e => {
        if (e.course) enrolledCourseIds.add(e.course.toString());
      });
      
      // Get certificates
      (user?.certificates || []).forEach(cert => {
        if (cert.course) userCertificates.add(cert.course.toString());
      });
    }

   const courses = await Course.find({
  isPublished: true,
  approvalStatus: "approved"
}).populate("instructor", "name");
const coursesWithStatus = courses.map(course => {
  const courseObj = course.toObject();
  
  const isEnrolled =
    enrolledCourseIds.has(course._id.toString()) ||
    (userId && course.students.some(s => s.toString() === userId.toString()));
  
  const hasCertificate = userCertificates.has(course._id.toString());
  
  const isOwn = userId && course.instructor?._id?.toString() === userId.toString();

  return {
    ...courseObj,
    isEnrolled,
    hasCertificate,
    isOwn
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

        if (!course.isPublished || course.approvalStatus !== "approved") {
      const userId = req.session.userId || req.session.user?._id;
      const isOwner = userId && course.instructor?._id?.toString() === userId.toString();
      const isAdmin = req.session.role === "admin" || req.session.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(404).render("public/page-404");
      }
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
