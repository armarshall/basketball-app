// server/src/routes/imageRoutes.ts
import express from 'express';
import multer from 'multer';
import { Image } from '../models/Image';
import fs from 'fs';

const router = express.Router();

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {  // Changed 'req' to '_req'
    // Keep original filename with extension
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (_req, file, cb) => {  // Changed 'req' to '_req'
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'));
    }
  }
});

// Upload image
router.post('/upload', upload.single('image'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const newImage = new Image({
      filename: req.file.filename,
      url: `http://localhost:3000/uploads/${req.file.filename}`
    });
    
    await newImage.save();
    return res.json({ 
      success: true, 
      message: 'Image uploaded successfully!', 
      image: newImage 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Upload failed' 
    });
  }
});

// Get all images
router.get('/', async (_req: any, res: any) => {  // Changed 'req' to '_req'
  try {
    const images = await Image.find().sort({ uploadDate: -1 });
    return res.json(images);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch images' });
  }
});

export default router;