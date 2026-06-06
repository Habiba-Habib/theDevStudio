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
  getEnrolledStudents
} = require('../controllers/instructor-controller');


router.use(isInstructor);

// ── SUBMISSION DOWNLOAD (instructor downloads student's submitted file) ──
router.get('/submission-download', async (req, res) => {
  try {
    const { url, name } = req.query;
    if (!url) return res.status(400).render("public/error-page", {
      statusCode: 400,
      errorTitle: "Invalid Request",
      message: "The file URL is missing or invalid."
    });

    const https      = require('https');
    const unzipper   = require('unzipper');
    const cloudinary = require('../config/cloudinary');

    // Extract public_id and generate authenticated download URL
    const urlMatch = decodeURIComponent(url).match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
    if (!urlMatch) return res.status(400).render("public/error-page", {
      statusCode: 400,
      errorTitle: "Invalid Request",
      message: "The file URL is missing or invalid."
    });

    const publicId    = decodeURIComponent(urlMatch[1]);
    const downloadUrl = cloudinary.utils.download_zip_url({ public_ids: [publicId], resource_type: 'raw' });
    const fileName    = name ? decodeURIComponent(name) : publicId.split('/').pop();

    https.get(downloadUrl, (fileRes) => {
      if (fileRes.statusCode !== 200) return res.status(502).render("public/error-page", {
        statusCode: 502,
        errorTitle: "Download Failed",
        message: "Failed to fetch the file from storage."
      });
      const chunks = [];
      fileRes.on('data', c => chunks.push(c));
      fileRes.on('end', async () => {
        try {
          const buf         = Buffer.concat(chunks);
          const dir         = await unzipper.Open.buffer(buf);
          const fileContent = await dir.files[0].buffer();
          const ext         = fileName.split('.').pop().toLowerCase();
          const mimeMap     = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
          res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
          res.setHeader('Content-Length', fileContent.length);
          res.send(fileContent);
        } catch (e) { res.status(500).render("public/error-page", {
  statusCode: 500,
  errorTitle: "Internal Server Error",
  message: "Something went wrong on our side."
}); }
      });
    }).on('error', () => res.status(500).render("public/error-page", {
  statusCode: 500,
  errorTitle: "Internal Server Error",
  message: "Something went wrong on our side."
}));
  } catch (err) {
    console.error(err);
    res.status(500).render("public/error-page", {
      statusCode: 500,
      errorTitle: "Internal Server Error",
      message: "Something went wrong on our side."
    });
  }
});

router.get('/dashboard',     getDashboard);

router.get('/profile',       getProfile);
router.get('/edit-profile',  getEditProfile);
router.post('/edit-profile', updateProfile);

router.get('/create/step1',  getCreateStep1);
router.post('/create/step1', uploadCourseThumbnail, postCreateStep1);
router.get('/create/step2',  getCreateStep2);
router.post('/create/step2', postCreateStep2);
router.get('/create/step3',  getCreateStep3);
router.post('/create/step3', postCreateStep3);
router.get('/create/step1',  getCreateStep1);
router.get('/create/step2',  getCreateStep2);
router.post('/create/step2', postCreateStep2);
router.get('/create/step3',  getCreateStep3);
router.post('/create/step3', postCreateStep3);
router.post('/delete-draft/:id', deleteDraft);



router.get('/courses/:id/edit',     getEditCourse);
router.post('/courses/:id/edit', uploadCourseMaterials, updateCourse);
router.post('/courses/:id/delete',  deleteCourse);
router.get('/courses/:id/students', getEnrolledStudents);

module.exports = router;