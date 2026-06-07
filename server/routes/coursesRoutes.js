const express          = require("express");
const router           = express.Router();
const courseController = require("../controllers/courseController");

router.get("/all-courses", courseController.getAllCourses);
router.get("/:id",         courseController.getCourseDescription);

module.exports = router;
