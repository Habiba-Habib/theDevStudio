const express    = require("express");
const router     = express.Router();
const isAdmin    = require("../middleware/isAdmin");
const controller = require("../controllers/adminController");

router.use(isAdmin);

// Dashboard
router.get("/dashboard", controller.getDashboard);

// Profile
router.get("/profile",         controller.getProfile);
router.post("/profile/update", controller.updateProfile);

// User management
router.get("/users",                          controller.getUsers);
router.post("/users/change-role",             controller.changeRole);
router.post("/users/toggle-suspend/:userId",  controller.toggleSuspend);

// Challenges oversight
router.get("/manage-challenges", controller.getChallenges);

module.exports = router;