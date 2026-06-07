module.exports = function isStudent(req, res, next) {
  if (!req.session || !req.session.userId) {
    if (req.method === "GET") req.session.returnTo = req.originalUrl;
    return res.redirect("/auth/login");
  }

  if (req.session.role !== "student" && req.session.role !== "instructor") {
    return res.status(403).render("public/error-page", {
      statusCode: 403,
      errorTitle: "Access Denied",
      message: "Students and instructors only."
    });
  }

  next();
};
