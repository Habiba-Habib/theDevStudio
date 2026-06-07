const express = require('express');
const router = express.Router();
const isInstructor = require('../middleware/isInstructor');

const {
  uploadCourseThumbnail,
  uploadCourseMaterials
} = require("../middleware/uploadMiddleware");


const {
  getDashboard,
  getProfile,
  getEditProfile,
  updateProfile,
  getCreateStep1,
  postCreateStep1,
  getCreateStep2,
  postCreateStep2,
  getCreateStep3,
  postCreateStep3,
  deleteDraft,
  getEditCourse,
  updateCourse,
  deleteCourse,
  getEnrolledStudents,
  downloadSubmission
} = require("../controllers/instructor-controller");

const courseController = require("../controllers/courseController");

router.use(isInstructor);

router.get("/submission-download", downloadSubmission);

router.get('/dashboard',     getDashboard);

router.get('/profile',       getProfile);
router.get('/edit-profile',  getEditProfile);
router.post('/edit-profile', updateProfile);

router.get('/create/step1',  getCreateStep1);
router.post('/create/step1', uploadCourseThumbnail, postCreateStep1);

router.get('/create/step2',  getCreateStep2);
router.post('/create/step2', uploadCourseMaterials, postCreateStep2);

router.get('/create/step3',  getCreateStep3);
router.post('/create/step3', postCreateStep3);

router.post('/delete-draft/:id', deleteDraft);



router.get('/courses/:id/edit',     getEditCourse);
router.post('/courses/:id/edit', uploadCourseMaterials, updateCourse);
router.post('/courses/:id/delete',  deleteCourse);
router.get('/courses/:id/students', getEnrolledStudents);
router.get('/courses/:id/preview',  courseController.getCourseContent);

module.exports = router;
