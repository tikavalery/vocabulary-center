const express = require('express');
const PDF = require('../models/PDF');
const { authenticate, isAdmin } = require('../middleware/auth');
const { cloudinary } = require('../utils/cloudinary');
const multer = require('multer');

const router = express.Router();

// Public route: Get all PDFs with search, filter, and sort
router.get('/', async (req, res) => {
  try {
    const { search, language, sort, page = 1, limit = 12 } = req.query;
    
    // Build query
    const query = {};
    
    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    // Filter by language
    if (language) {
      query.language = language;
    }
    
    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'price-low':
        sortObj = { price: 1 };
        break;
      case 'price-high':
        sortObj = { price: -1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get PDFs
    const pdfs = await PDF.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await PDF.countDocuments(query);
    
    res.json({
      pdfs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    res.status(500).json({ message: 'Error fetching PDFs', error: error.message });
  }
});

// Public route: Get single PDF by ID
router.get('/:id', async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    
    res.json({ pdf });
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(500).json({ message: 'Error fetching PDF', error: error.message });
  }
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error('Invalid file: file buffer is missing'));
    }

    const uploadOptions = {
      folder: `vocabulary-center/${folder}`,
      resource_type: resourceType
    };

    // For raw files (PDFs), we don't need format option
    // Cloudinary will handle it based on resource_type: 'raw'

    console.log(`Uploading ${resourceType} file to Cloudinary folder: ${uploadOptions.folder}`);
    console.log(`File size: ${file.buffer.length} bytes`);

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log(`Successfully uploaded to: ${result.secure_url}`);
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

// Admin route: Create PDF
router.post('/',
  authenticate,
  isAdmin,
  multer().fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // Validate required fields
      const { title, language, price, description } = req.body;
      
      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Title is required' });
      }
      if (!language || !language.trim()) {
        return res.status(400).json({ message: 'Language is required' });
      }
      if (!price || isNaN(price) || parseFloat(price) < 0) {
        return res.status(400).json({ message: 'Price must be a positive number' });
      }
      if (!description || !description.trim()) {
        return res.status(400).json({ message: 'Description is required' });
      }

      // Check if files were uploaded
      if (!req.files) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      if (!req.files['coverImage'] || req.files['coverImage'].length === 0) {
        return res.status(400).json({ message: 'Cover image is required' });
      }

      if (!req.files['pdfFile'] || req.files['pdfFile'].length === 0) {
        return res.status(400).json({ message: 'PDF file is required' });
      }

      console.log('Files received:');
      console.log('- Cover Image:', req.files['coverImage'][0].originalname, req.files['coverImage'][0].mimetype);
      console.log('- PDF File:', req.files['pdfFile'][0].originalname, req.files['pdfFile'][0].mimetype);
      
      // Upload files to Cloudinary
      let coverImageUrl, pdfFileUrl;
      try {
        [coverImageUrl, pdfFileUrl] = await Promise.all([
          uploadToCloudinary(req.files['coverImage'][0], 'images', 'image'),
          uploadToCloudinary(req.files['pdfFile'][0], 'pdfs', 'raw')
        ]);
        console.log('Files uploaded successfully:');
        console.log('- Cover Image URL:', coverImageUrl);
        console.log('- PDF File URL:', pdfFileUrl);
      } catch (uploadError) {
        console.error('Error uploading files to Cloudinary:', uploadError);
        return res.status(500).json({ 
          message: 'Failed to upload files to Cloudinary', 
          error: uploadError.message 
        });
      }
      
      const pdf = new PDF({
        title,
        language,
        price: parseFloat(price),
        description,
        coverImageUrl,
        pdfFileUrl
      });
      
      await pdf.save();
      
      res.status(201).json({ message: 'PDF created successfully', pdf });
    } catch (error) {
      console.error('Error creating PDF:', error);
      res.status(500).json({ message: 'Error creating PDF', error: error.message });
    }
  }
);

// Admin route: Update PDF
router.put('/:id',
  authenticate,
  isAdmin,
  multer().fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const pdf = await PDF.findById(req.params.id);
      if (!pdf) {
        return res.status(404).json({ message: 'PDF not found' });
      }

      // Validate and update fields
      if (req.body.title) {
        if (!req.body.title.trim()) {
          return res.status(400).json({ message: 'Title cannot be empty' });
        }
        pdf.title = req.body.title;
      }
      if (req.body.language) {
        if (!req.body.language.trim()) {
          return res.status(400).json({ message: 'Language cannot be empty' });
        }
        pdf.language = req.body.language;
      }
      if (req.body.price) {
        const price = parseFloat(req.body.price);
        if (isNaN(price) || price < 0) {
          return res.status(400).json({ message: 'Price must be a positive number' });
        }
        pdf.price = price;
      }
      if (req.body.description) {
        if (!req.body.description.trim()) {
          return res.status(400).json({ message: 'Description cannot be empty' });
        }
        pdf.description = req.body.description;
      }
      
      // Update cover image if new one uploaded
      if (req.files && req.files['coverImage']) {
        pdf.coverImageUrl = await uploadToCloudinary(req.files['coverImage'][0], 'images', 'image');
      }
      
      // Update PDF file if new one uploaded
      if (req.files && req.files['pdfFile']) {
        pdf.pdfFileUrl = await uploadToCloudinary(req.files['pdfFile'][0], 'pdfs', 'raw');
      }
      
      await pdf.save();
      
      res.json({ message: 'PDF updated successfully', pdf });
    } catch (error) {
      console.error('Error updating PDF:', error);
      res.status(500).json({ message: 'Error updating PDF', error: error.message });
    }
  }
);

// Admin route: Delete PDF
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    
    // TODO: Delete files from Cloudinary
    
    await PDF.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'PDF deleted successfully' });
  } catch (error) {
    console.error('Error deleting PDF:', error);
    res.status(500).json({ message: 'Error deleting PDF', error: error.message });
  }
});

// Public route: Get all unique languages
router.get('/languages/list', async (req, res) => {
  try {
    const languages = await PDF.distinct('language');
    res.json({ languages });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ message: 'Error fetching languages', error: error.message });
  }
});

module.exports = router;

