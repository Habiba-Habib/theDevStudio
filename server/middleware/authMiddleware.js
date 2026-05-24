exports.isLoggedIn = (req, res, next) => {

  if (!req.session.user) {
    return res.status(401).json({
      message: "You must login first"
    });
  }

  next();
};