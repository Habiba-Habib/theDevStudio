
module.exports = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  if (req.session.role !== 'instructor') return res.redirect('/auth/login');
  next();
};
