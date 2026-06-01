const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      // Videos
      'video/mp4', 'video/mkv', 'video/avi', 'video/mov',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // ✅ accept file
    } else {
      cb(new Error('File type not allowed'), false); // ❌ reject file
    }
  }
});

// Upload single file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileStr, {
      folder: 'my_project',
      resource_type: 'auto', // auto detects image, video, or raw (documents)
    });

    res.status(200).json({
      message: 'Upload successful',
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type, // tells you if it's image, video, or raw
      format: result.format,               // tells you the file format (pdf, mp4, etc.)
    });

  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Upload multiple files at once
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    const uploadPromises = req.files.map(file => {
      const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      return cloudinary.uploader.upload(fileStr, {
        folder: 'my_project',
        resource_type: 'auto',
      });
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      message: 'All files uploaded successfully',
      files: results.map(r => ({
        url: r.secure_url,
        public_id: r.public_id,
        resource_type: r.resource_type,
        format: r.format,
      }))
    });

  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;