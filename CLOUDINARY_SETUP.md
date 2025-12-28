# Cloudinary Setup Guide

## Issue: No vocabulary-center folder in Cloudinary

The `vocabulary-center` folder in Cloudinary is created **automatically** when you upload your first file. If you don't see it, it means no PDFs have been uploaded yet.

## Steps to Upload PDFs

### 1. Verify Cloudinary Credentials

Make sure your `backend/.env` file has the correct credentials:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Test Cloudinary Connection (Optional)

Run the test script to verify your Cloudinary setup:

```bash
node backend/scripts/test-cloudinary.js
```

This will:
- Verify your credentials are correct
- Check if the vocabulary-center folder exists
- Show you what folders/files are in your Cloudinary account

### 3. Upload PDFs Through Admin Panel

1. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start your frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Log in as admin:**
   - Go to http://localhost:3000/login
   - Email: `admin@vocabulary.com`
   - Password: `admin123`
   (Or use the admin account you created)

4. **Go to Admin Dashboard:**
   - Click on "Admin" in the navbar
   - Or go directly to http://localhost:3000/admin

5. **Create a new PDF:**
   - Click "Create New PDF" button
   - Fill in the form:
     - Title
     - Language
     - Price
     - Description
     - Upload a cover image
     - Upload a PDF file
   - Click "Create PDF"

6. **Check server console:**
   You should see logs like:
   ```
   Uploading image file to Cloudinary folder: vocabulary-center/images
   File size: [size] bytes
   Successfully uploaded to: https://res.cloudinary.com/...
   Uploading raw file to Cloudinary folder: vocabulary-center/pdfs
   File size: [size] bytes
   Successfully uploaded to: https://res.cloudinary.com/...
   ```

7. **Verify in Cloudinary:**
   - Go to your Cloudinary dashboard
   - Navigate to Media Library
   - You should now see the `vocabulary-center` folder
   - Inside, you'll find `images` and `pdfs` subfolders

## Troubleshooting

### If upload fails:

1. **Check server console** for error messages
2. **Verify Cloudinary credentials** are correct in `.env`
3. **Check file size limits** (Cloudinary free tier: 10MB)
4. **Verify file formats:**
   - Cover image: JPG, PNG, WEBP
   - PDF: PDF files only

### Common errors:

- **"Invalid credentials"**: Check your `.env` file
- **"File too large"**: Reduce file size or upgrade Cloudinary plan
- **"Upload failed"**: Check internet connection and Cloudinary service status

## Important Notes

- **Folders are created automatically** - you don't need to create them manually
- **File URLs are saved in database** - make sure uploads complete successfully
- **Check server logs** - all upload attempts are logged with details
- **Existing PDFs with broken URLs** - delete and recreate them with proper file uploads

