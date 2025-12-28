const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for PDFs
const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vocabulary-center/pdfs',
    resource_type: 'raw',
    allowed_formats: ['pdf']
  }
});

// Configure storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vocabulary-center/images',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

// Multer upload middleware
const uploadPDF = multer({ storage: pdfStorage });
const uploadImage = multer({ storage: imageStorage });

// Combined upload for both PDF and image
const uploadFiles = multer({
  storage: multer.memoryStorage()
});

module.exports = {
  cloudinary,
  uploadPDF,
  uploadImage,
  uploadFiles
};

