const express              = require("express");
const router               = express.Router();
const challengesController = require("../controllers/challenges-controller");

router.get("/",    challengesController.getChallengesPage);
router.get("/:id", challengesController.getChallengeDescriptionPage);

module.exports = router;
