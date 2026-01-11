import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';

const router = express.Router();

// Setup upload directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
mkdir(uploadDir, { recursive: true }).catch(console.error);

// Helper to get API base URL from environment or request
const getApiBaseUrl = (req) => {
  if (process.env.API_HOST) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    return `${protocol}://${process.env.API_HOST}`;
  }
  // Auto-detect from request if API_HOST not set
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}`;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept image files for product images
  if (req.path === '/image') {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  } 
  // Accept document files for CVs
  else if (req.path === '/cv' || req.path === '/') {
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
  else {
    cb(new Error('Invalid upload type'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload image
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate absolute URL for the uploaded image using dynamic base URL
    const apiBase = getApiBaseUrl(req);
    const imageUrl = `${apiBase}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed: ' + error.message });
  }
});

// Generic file upload (for CV, documents, etc.)
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate absolute URL for the uploaded file using dynamic base URL
    const apiBase = getApiBaseUrl(req);
    const fileUrl = `${apiBase}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed: ' + error.message });
  }
});

export default router;
