router.get('/leaderboard', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const players = await User.find().sort({ points: -1 }).limit(10);
  const currentUser = await User.findById(req.session.userId);

  res.render('leaderboard', {
    players,
    topPlayers: players.slice(0, 3),
    currentUser
  });
});