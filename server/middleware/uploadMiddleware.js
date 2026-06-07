const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const MB = 1024 * 1024;

const allowedTypes = {
  image: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ],
  archive: [
    "application/zip",
    "application/x-zip-compressed"
  ]
};

function getUploadCategory(file) {
  const field = file.fieldname;

  if (field === "thumbnail") {
    return "image";
  }

  if (field === "cv") {
    return "document";
  }

  if (field === "certificate") {
    if (
      allowedTypes.document.includes(file.mimetype) ||
      allowedTypes.image.includes(file.mimetype)
    ) {
      return "certificate";
    }
    return "invalid";
  }

  if (field.includes("videoFile")) {
    return "video";
  }

  if (
    field.includes("resourceFile") ||
    field.includes("assignmentFile")
  ) {
    if (
      allowedTypes.document.includes(file.mimetype) ||
      allowedTypes.archive.includes(file.mimetype) ||
      allowedTypes.image.includes(file.mimetype)
    ) {
      return "resource";
    }
    return "invalid";
  }

  return "invalid";
}

function fileFilter(req, file, cb) {
  const category = getUploadCategory(file);

  if (category === "image") {
    if (!allowedTypes.image.includes(file.mimetype)) {
      return cb(new Error("Thumbnail must be JPG, PNG, or WEBP."));
    }
  }

  if (category === "document") {
    if (!allowedTypes.document.includes(file.mimetype)) {
      return cb(new Error("CV must be PDF, DOC, or DOCX."));
    }
  }

  if (category === "certificate") {
    const valid =
      allowedTypes.document.includes(file.mimetype) ||
      allowedTypes.image.includes(file.mimetype);

    if (!valid) {
      return cb(new Error("Certificate must be PDF, DOC, DOCX, JPG, PNG, or WEBP."));
    }
  }

  if (category === "video") {
    if (!allowedTypes.video.includes(file.mimetype)) {
      return cb(new Error("Video lessons must be MP4, WEBM, or MOV."));
    }
  }

  if (category === "resource") {
    const valid =
      allowedTypes.document.includes(file.mimetype) ||
      allowedTypes.archive.includes(file.mimetype) ||
      allowedTypes.image.includes(file.mimetype);

    if (!valid) {
      return cb(new Error("Resources must be PDF, DOC, DOCX, ZIP, JPG, PNG, or WEBP."));
    }
  }

  if (category === "invalid") {
    return cb(new Error("Invalid upload field or unsupported file type."));
  }

  cb(null, true);
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "thedevstudio/misc";
    let resource_type = "raw";

    if (file.fieldname === "thumbnail") {
      folder = "thedevstudio/course-thumbnails";
      resource_type = "image";
    }

    if (file.fieldname === "cv" || file.fieldname === "certificate") {
      folder = "thedevstudio/instructor-verification";
      resource_type = "raw";
    }

    if (file.fieldname.includes("videoFile")) {
      folder = "thedevstudio/course-videos";
      resource_type = "video";
    }

    if (file.fieldname.includes("resourceFile")) {
      folder = "thedevstudio/course-resources";
      resource_type = "raw";
    }

    if (file.fieldname.includes("assignmentFile")) {
      folder = "thedevstudio/assignments";
      resource_type = "raw";
    }

    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    const publicId = `${baseName}-${Date.now()}`;

    return {
      folder,
      resource_type,
      public_id: resource_type === "raw" ? `${publicId}${ext}` : publicId
    };
  }
});

function createUploader(maxFileSize) {
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize
    }
  });
}

function handleUpload(uploadMiddleware) {
  return function (req, res, next) {
    uploadMiddleware(req, res, function (err) {
      if (!err) {
        return next();
      }

      let message = err.message || "File upload failed.";

      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          message = "The uploaded file is too large.";
        }
      }

      return res.status(400).render("public/error-page", {
        statusCode: 400,
        errorTitle: "Upload Error",
        message
      });
    });
  };
}

const uploadCourseThumbnail = handleUpload(
  createUploader(5 * MB).single("thumbnail")
);

const uploadInstructorVerification = handleUpload(
  createUploader(10 * MB).fields([
    { name: "cv", maxCount: 1 },
    { name: "certificates", maxCount: 5 } 
  ])
);


const uploadCourseMaterials = handleUpload(
  createUploader(500 * MB).any()
);

module.exports = {
  uploadCourseThumbnail,
  uploadInstructorVerification,
  uploadCourseMaterials
};