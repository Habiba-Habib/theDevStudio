exports.isLoggedIn = (req, res, next) => {

  if (!req.session.user) {
    return res.status(401).json({
      message: "You must login first"
    });
  }

  next();
};
exports.requireLoginPage = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/auth/login");
  }

  next();
};