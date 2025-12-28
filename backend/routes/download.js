const express = require('express');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const PDF = require('../models/PDF');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Helper function to fetch file from URL with redirect support
const fetchFile = (url, maxRedirects = 5) => {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      return reject(new Error('Too many redirects'));
    }

    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js PDF Downloader'
      }
    };

    const req = client.request(options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : `${urlObj.protocol}//${urlObj.hostname}${res.headers.location}`;
        return fetchFile(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }

      // Handle errors
      if (res.statusCode !== 200) {
        // Consume the response to free up memory
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}: Failed to fetch file`));
        return;
      }

      resolve(res);
    });

    req.on('error', reject);
    req.end();
  });
};

const router = express.Router();

// Secure PDF download route
// Only accessible to users who purchased the PDF
// Proxies the PDF from Cloudinary through our server for security
router.get('/:pdfId', authenticate, async (req, res) => {
  try {
    const { pdfId } = req.params;

    // Find PDF
    const pdf = await PDF.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Check if user purchased this PDF
    const user = await User.findById(req.user._id);
    const hasPurchased = user.purchasedPdfs.some(
      id => id.toString() === pdfId
    );

    if (!hasPurchased) {
      return res.status(403).json({ message: 'You must purchase this PDF to download it' });
    }

    // Proxy the PDF from Cloudinary
    try {
      console.log('Fetching PDF from URL:', pdf.pdfFileUrl);
      
      const cloudinaryRes = await fetchFile(pdf.pdfFileUrl);

      // Set appropriate headers for PDF download
      const filename = `${pdf.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      if (cloudinaryRes.headers['content-length']) {
        res.setHeader('Content-Length', cloudinaryRes.headers['content-length']);
      }

      // Pipe the PDF data to the response
      cloudinaryRes.pipe(res);

      cloudinaryRes.on('error', (error) => {
        console.error('Error streaming PDF:', error);
        if (!res.headersSent) {
          res.status(500).json({
            message: 'Error streaming PDF',
            error: error.message
          });
        }
      });

    } catch (fetchError) {
      console.error('Error fetching PDF from Cloudinary:', fetchError);
      console.error('PDF URL was:', pdf.pdfFileUrl);
      
      if (!res.headersSent) {
        res.status(500).json({
          message: 'Failed to fetch PDF from storage',
          error: fetchError.message,
          details: 'The PDF file may not be accessible from Cloudinary. Please verify the file exists and the URL is correct.',
          pdfUrl: pdf.pdfFileUrl
        });
      }
    }
  } catch (error) {
    console.error('Error authorizing download:', error);
    res.status(500).json({ message: 'Error authorizing download', error: error.message });
  }
});

module.exports = router;

