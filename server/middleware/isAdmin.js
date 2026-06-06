// NOTE: isAdmin is bypassed by the fake session above.
// Once auth is connected to MongoDB, remove the fake session
// and uncomment router.use(isAdmin) in adminRoutes.js


module.exports = function isAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).render("public/error-page", {
  statusCode: 403,
  errorTitle: "Access Denied",
  message: "Admins only."
});
  }
  next();
};