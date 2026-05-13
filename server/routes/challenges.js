const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenges');

const User = require('../models/User');

const isLoggedIn =(req,res,next)=>{
  if(!req.session.userId)return res.redirect('/login');
  next();
  
};

router.use(isLoggedIn);

router.get('/', async (req, res) => {

  try{
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
}
catch(err){
  console.error(err);
  res.status(500).render('public/error404',{message:'Server error'});
}
});

router.get('/:id', async (req, res) => {
  try{

  if (!req.session.userId) return res.redirect('/login');

  const challenge = await Challenge.findById(req.params.id);
  if(!challenge){
    return res.status(404).render('public/error404', {message:'Challenge not found'});
  }

  res.render('student/challenge', { challenge });
}catch(err){
  console.error(err);
  res.status(500).render('public/error404',{message:'Server error'})
}
});

module.exports = router;