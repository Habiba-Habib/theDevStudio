const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');

const User = require('../models/User');

router.get('/', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const challenges = await Challenge.find();

  const totalPoints = challenges.reduce((sum, c) => sum + c.points, 0);
  const totalUsers = await User.countDocuments({ role: 'student' });

  res.render('student/challenges', {
    challenges,
    stats: {
      totalChallenges: challenges.length,
      totalPoints,
      totalUsers
    }
  });
});

router.get('/:id', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const challenge = await Challenge.findById(req.params.id);

  res.render('student/challenge', { challenge });
});

module.exports = router;