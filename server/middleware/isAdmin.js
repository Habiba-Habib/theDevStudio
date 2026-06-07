module.exports = function isAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth/admin-login");
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