const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/profile', async (req, res) => {
  // if (!req.session.userId) return res.redirect('/login');
  
  const user = await User.findById(req.session.userId).populate('completedCourses');
   res.render('shared/profile', {
    user: user,
    completedCourses:  user.completedCourses || [],
    certificates: user.certificates || []  
  });
  });

router.get('/edit-profile', async (req, res) => {
 
  res.render('shared/edit-profile', { user });
});



router.post('/edit-profile', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const { name, email, bio } = req.body;

  await User.findByIdAndUpdate(req.session.userId, { name, email, bio });

  res.redirect('/shared/profile');
});

module.exports = router;