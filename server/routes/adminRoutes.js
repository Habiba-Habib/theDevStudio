const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/admin-controller");
const aiController = require("../controllers/ai-controller");

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
router.post("/manage-challenges/:id/delete", controller.deleteChallenge);
router.post("/manage-challenges/:id/restore", controller.restoreChallenge);
router.post("/manage-challenges/:id/permanent-delete", controller.permanentlyDeleteChallenge);
router.get("/instructor-applications", controller.getInstructorApplications);
router.post("/instructor-applications/:userId/approve", controller.approveInstructor);
router.post("/instructor-applications/:userId/reject", controller.rejectInstructor);
router.get("/create-challenge",              controller.getCreateChallenge);
router.post("/create-challenge", controller.postCreateChallenge);
router.post("/generate-challenge", aiController.generateChallengeDraft);

module.exports = router;