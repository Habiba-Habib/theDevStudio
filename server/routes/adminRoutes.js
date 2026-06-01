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
router.get("/users/:userId/profile",         controller.getUserProfile);
router.get("/users/:userId/courses", controller.getUserCourses);
router.post("/users/toggle-suspend/:userId", controller.toggleSuspend);
router.post("/users/delete/:userId", controller.deleteUser);
router.post("/users/:userId/block", controller.blockInstructor);
router.post("/users/:userId/unblock", controller.unblockInstructor);
router.get("/manage-challenges",             controller.getChallenges);
router.post("/manage-challenges/:id/delete", controller.deleteChallenge);
router.post("/manage-challenges/:id/restore", controller.restoreChallenge);
router.post("/manage-challenges/:id/permanent-delete", controller.permanentlyDeleteChallenge);
router.get("/instructor-applications", controller.getInstructorApplications);
router.post("/instructor-applications/:userId/approve", controller.approveInstructor);
router.post("/instructor-applications/:userId/reject", controller.rejectInstructor);
router.get("/create-challenge",              controller.getCreateChallenge);
router.post("/create-challenge", controller.postCreateChallenge);
router.get("/challenges/:id/edit", controller.getEditChallenge);
router.post("/challenges/:id/edit", controller.postEditChallenge);
router.post("/generate-challenge", aiController.generateChallengeDraft);

module.exports = router;