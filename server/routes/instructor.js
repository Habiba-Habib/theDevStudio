const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const isInstructor = require('../middleware/isInstructor');
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
  getEditCourse,
  updateCourse,
  deleteCourse,
  getEnrolledStudents
} = require('../controllers/instructorController');


// Apply middleware to ALL routes in this file
router.use(isInstructor);

// ─── DASHBOARD ────────────────────────────────────────────────
router.get('/dashboard', getDashboard);

// ─── PROFILE ──────────────────────────────────────────────────
router.get('/profile',      getProfile);
router.get('/edit-profile', getEditProfile);
router.post('/edit-profile', upload.single('avatar'), updateProfile);

// ─── CREATE COURSE ────────────────────────────────────────────
router.get('/create/step1',  getCreateStep1);
router.post('/create/step1', upload.single('thumbnail'), postCreateStep1);
router.get('/create/step2',  getCreateStep2);
router.post('/create/step2', postCreateStep2);
router.get('/create/step3',  getCreateStep3);
router.post('/create/step3', postCreateStep3);

// ─── MANAGE COURSES ───────────────────────────────────────────
router.get('/courses/:id/edit',              getEditCourse);
router.post('/courses/:id/edit', upload.single('thumbnail'), updateCourse);
router.post('/courses/:id/delete',           deleteCourse);
router.get('/courses/:id/students',          getEnrolledStudents);

module.exports = router;