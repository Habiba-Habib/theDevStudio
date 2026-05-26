const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/admin-controller");

// TEMP: fake admin session — remove before submission
router.use((req, res, next) => {
  req.session.user = {
    _id:  "000000000000000000000001",
    name: "Admin",
    role: "admin"
  };
  next();
});

router.get("/dashboard",                     controller.getDashboard);
router.get("/profile",                       controller.getProfile);
router.post("/profile/update",               controller.updateProfile);
router.get("/users",                         controller.getUsers);
router.post("/users/change-role",            controller.changeRole);
router.post("/users/toggle-suspend/:userId", controller.toggleSuspend);
router.get("/manage-challenges",             controller.getChallenges);

module.exports = router;