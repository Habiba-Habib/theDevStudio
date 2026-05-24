module.exports = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
  if (req.session.role !== 'instructor') return res.redirect('/login');
  next();
};