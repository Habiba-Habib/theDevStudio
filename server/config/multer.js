const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const path = require('path');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'thedevstudio/others';
    let resource_type = 'auto'; // Auto-detects videos, images, PDFs, etc.

    // Sort uploads into dedicated folders on Cloudinary based on field names
    if (file.fieldname === 'thumbnail') {
      folder = 'thedevstudio/thumbnails';
      resource_type = 'image';
    } else if (file.fieldname.includes('videoFile')) {
      folder = 'thedevstudio/videos';
      resource_type = 'video'; // Cloudinary handles streaming optimization automatically
    } else if (file.fieldname.includes('resourceFile')) {
      folder = 'thedevstudio/resources';
      resource_type = 'raw'; // Keeps PDFs/Word docs in raw original formats
    } else if (file.fieldname.includes('assignmentFile')) {
      folder = 'thedevstudio/assignments';
      resource_type = 'raw';
    }

    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const publicId = `${base}_${Date.now()}`;

    return {
      folder: folder,
      resource_type: resource_type,
      public_id: resource_type === 'raw' ? `${publicId}${ext}` : publicId,
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

module.exports = upload;
