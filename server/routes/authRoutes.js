const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

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
router.post("/forgot-password", authController.forgotPassword);
/* SIGNUP (student/instructor only) */
router.post("/signup", authController.signup);

/* LOGIN (student/instructor/admin) */
router.post("/login", authController.login);

/* LOGOUT */
router.post("/logout", authController.logout);

module.exports = router;