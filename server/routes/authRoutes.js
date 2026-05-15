const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

/* SIGNUP (student/instructor only) */
router.post("/signup", authController.signup);

/* LOGIN (student/instructor/admin) */
router.post("/login", authController.login);

/* LOGOUT */
router.post("/logout", authController.logout);

module.exports = router;