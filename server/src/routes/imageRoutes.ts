// server/src/routes/imageRoutes.ts
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
  const newImage = new Image({
    filename: req.file.filename,
    url: `http://localhost:3000/uploads/${req.file.filename}`
  });
  
  await newImage.save();
  res.json({ success: true, message: 'Image uploaded!', image: newImage });
});

router.get('/', async (_req: any, res: any) => {
  const images = await Image.find().sort({ uploadDate: -1 });
  res.json(images);
});

export default router;