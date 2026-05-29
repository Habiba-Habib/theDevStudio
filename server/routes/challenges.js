const express = require('express');
const router = express.Router();
const Challenge = require('../models/challenges');

const User = require('../models/User');

// const isLoggedIn =(req,res,next)=>{
//   if(!req.session.userId)return res.redirect('/login');
//   next();
  
// };

// router.use(isLoggedIn);

router.get('/', async (req, res) => {

  try{
  const challenges = await Challenge.find({isPublished: true});
  const totalPoints = challenges.reduce((sum, c) => sum + c.points, 0);
  const activeSince = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const totalUsers = await User.countDocuments({
    role: 'student',
    lastActive: { $gte: activeSince }
  });

  res.render('guest/coding-challenges', {
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
  res.status(500).render('public/page-404',{message:'Server error'});
}
});

router.get('/:id', async (req, res) => {
  try{

  // if (!req.session.userId) return res.redirect('/login');

  const challenge = await Challenge.findById(req.params.id);
  if(!challenge){
    return res.status(404).render('public/page-404', {message:'Challenge not found'});
  }

  res.render('guest/challenge-description', { challenge });
}catch(err){
  console.error(err);
  res.status(500).render('public/page-404',{message:'Server error'})
}
});

module.exports = router;