import express from 'express';
import multer from 'multer';
import { Image } from '../models/Image';
import fs from 'fs';

const router = express.Router();

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), async (req: any, res: any) => {
  try {
    const newImage = new Image({
      filename: req.file.filename,
      url: `http://localhost:3000/uploads/${req.file.filename}`
    });
    
    await newImage.save();
    return res.json({ success: true, message: 'Image uploaded!', image: newImage });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

router.get('/', async (_req: any, res: any) => {
  try {
    const images = await Image.find().sort({ uploadDate: -1 });
    return res.json(images);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch images' });
  }
});

export default router;