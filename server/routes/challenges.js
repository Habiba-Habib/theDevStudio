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
 const challenges = await Challenge.find({
  deletedAt: null
}).sort({ createdAt: -1 });

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
  res.status(500).render("public/error-page", {
    statusCode: 500,
    errorTitle: "Internal Server Error",
    message: "Something went wrong while loading the challenges."
  });
}
});

router.get('/:id', async (req, res) => {
  try{

  // if (!req.session.userId) return res.redirect('/login');

  const challenge = await Challenge.findById(req.params.id);
  if(!challenge){
    return res.status(404).render("public/error-page", {
  statusCode: 404,
  errorTitle: "Challenge Not Found",
  message: "This challenge does not exist or was removed."
});

  }

res.render('guest/challenge-description', {
  challenge: {
    ...challenge.toObject(),
    desc: challenge.description,
    details: [],
    examples: challenge.testCases.map(testCase => ({
      input: testCase.input,
      output: testCase.expectedOutput,
      explanation: ""
    })),
    defaultCode: challenge.starterCode,
    timeLimit: "No limit",
    stats: {
      totalSubmissions: 0,
      accepted: challenge.solvedCount || 0,
      successRate: "0%"
    }
  },
  isAdminView: req.session.role === "admin" || req.session.user?.role === "admin"
});
}catch(err){
  console.error(err);
  res.status(500).render("public/error-page", {
  statusCode: 500,
  errorTitle: "Internal Server Error",
  message: "Something went wrong while loading this challenge."
});
}
});

module.exports = router;