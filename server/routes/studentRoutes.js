const express = require("express");
const router = express.Router();
const User = require("../models/User");
const studentController = require("../controllers/studentController");


router.get("/dashboard", studentController.getDashboard);
router.get("/payment/:courseId", studentController.getPaymentPage);
router.get("/my-courses", studentController.getMyCourses);
router.post("/payment/:courseId", studentController.processPayment);


router.get("/profile", async (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");

  const user = await User.findById(req.session.userId).populate("completedCourses.course");

  res.render("shared/profile", {
    user,
    completedCourses: user.completedCourses || [],
    certificates: user.certificates || [],
  });
});

router.get("/edit-profile", async (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");

  const user = await User.findById(req.session.userId);
  res.render("shared/edit-profile", { user });
});

router.post("/edit-profile", async (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");

  const { name, fullname, username, email, bio, location } = req.body;

  await User.findByIdAndUpdate(req.session.userId, {
    name,
    fullname,
    username,
    email,
    bio,
    location,
    lastActive: new Date(),
  });

  res.redirect("/student/profile");
});

module.exports = router;