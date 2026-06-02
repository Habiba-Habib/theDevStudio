const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

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
    }

    return {
      folder: folder,
      resource_type: resource_type,
      public_id: file.originalname.split('.')[0] + '_' + Date.now(),
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
