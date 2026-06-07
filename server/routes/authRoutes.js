const express        = require("express");
const router         = express.Router();
const passport       = require("passport");
const authController = require("../controllers/authController");

/* ── PAGE RENDERS ── */
router.get("/login",          (req, res) => res.render("auth/login"));
router.get("/signup",         (req, res) => res.render("auth/signup"));
router.get("/admin-login",    (req, res) => res.render("auth/admin-login"));
router.get("/terms-of-services", (req, res) => res.render("auth/terms-of-services"));
router.get("/privacy-policy", (req, res) => res.render("auth/privacy-policy"));
router.get("/forgot-password",(req, res) => res.render("auth/forgot-password", {
  successMessage: null,
  errorMessage:   null
}));

/* ── AUTH ACTIONS ── */
router.post("/signup",                authController.signup);
router.post("/login",                 authController.login);
router.post("/logout",                authController.logout);
router.post("/admin-login",           authController.adminLogin);
router.post("/forgot-password",       authController.forgotPassword);
router.get( "/reset-password/:token", authController.getResetPassword);
router.post("/reset-password/:token", authController.postResetPassword);

/* ── ONBOARDING ── */
router.get( "/onboarding", authController.getOnboarding);
router.post("/onboarding", authController.postOnboarding);

/* ── GOOGLE OAUTH ── */
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login" }),
  authController.handleOAuthCallback
);

/* ── GITHUB OAUTH ── */
router.get("/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get("/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth/login" }),
  authController.handleOAuthCallback
);

module.exports = router;
