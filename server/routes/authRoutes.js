const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const passport = require("passport");

router.get("/login", (req, res) => {
  res.render("auth/login");
});
router.get("/signup", (req, res) => {
  res.render("auth/signup");
});
router.get("/forgot-password", (req, res) => {
  res.render("auth/forgot-password", {
    successMessage: null,
    errorMessage: null
  });
});
router.get("/reset-password/:token", authController.getResetPassword);
router.post("/reset-password/:token", authController.postResetPassword);
router.post("/forgot-password", authController.forgotPassword);
/* SIGNUP (student/instructor only) */
router.post("/signup", authController.signup);

/* LOGIN (student/instructor/admin) */
router.post("/login", authController.login);

/* LOGOUT */
router.post("/logout", authController.logout);

//Terms and conditions 
router.get("/terms-of-services", (req, res) => {
  res.render("auth/terms-of-services");
});

//Privacy Policy
router.get("/privacy-policy", (req, res) => {
  res.render("auth/privacy-policy");
});
router.get("/admin-login", (req, res) => {
  res.render("auth/admin-login");
});

router.post("/admin-login", authController.adminLogin);
module.exports = router;

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login"
  }),
  (req, res) => {
    req.session.user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };

    req.session.userId = req.user._id;
    req.session.role = req.user.role;

    res.redirect(`/${req.user.role}/dashboard`);
  }
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/auth/login"
  }),
  (req, res) => {
    req.session.user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };

    req.session.userId = req.user._id;
    req.session.role = req.user.role;

    res.redirect(`/${req.user.role}/dashboard`);
  }
);