module.exports = function isAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).send("Access denied. Admins only.");
  }
  next();
};