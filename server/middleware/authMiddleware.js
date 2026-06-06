exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  next();
};
exports.requireLoginPage = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/auth/login");
  }

  next();
};