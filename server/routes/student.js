const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/profile', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  
  const user = await User.findById(req.session.userId).populate('completedCourses');
  
  res.render('student/profile', {
    user,
    completedCourses: user.completedCourses,
    certificates: user.certificates
  });
});