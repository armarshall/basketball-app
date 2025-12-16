import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Team from '../models/teams';
import { Image } from '../models/Image';

const router = Router();

// Configure multer for team uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = 'uploads/teams';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'team-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for sponsor uploads
const sponsorStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = 'uploads/sponsors';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'sponsor-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

const sponsorUpload = multer({
  storage: sponsorStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// ========== GET ROUTES ==========

// GET all images
router.get('/', async (_req, res) => {
  try {
    console.log('📸 Fetching all images...');
    const images = await Image.find().sort({ uploadDate: -1 });
    console.log(`✅ Found ${images.length} images`);
    return res.json(images);
  } catch (error) {
    console.error('❌ Error fetching images:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET sponsor images (filter by sponsor folder or keywords)
router.get('/sponsors', async (_req, res) => {
  try {
    const sponsorImages = await Image.find({
      $or: [
        { url: { $regex: /\/sponsors\//i } }, // Images in sponsors folder
        { filename: { $regex: /(sponsor|nike|gatorade|wilson|baltimore|logo)/i } } // Or matching keywords
      ]
    }).sort({ uploadDate: -1 });
    
    console.log(`📸 Found ${sponsorImages.length} sponsor images`);
    return res.json(sponsorImages);
  } catch (error) {
    console.error('Error fetching sponsor images:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET specific image by ID
router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }
    return res.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ========== UPLOAD ROUTES ==========

// General sponsor image upload route
router.post('/upload', sponsorUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const imageUrl = `/uploads/sponsors/${req.file.filename}`;
    
    // Save image metadata to database
    const newImage = new Image({
      filename: req.file.filename,
      originalFilename: req.file.originalname, // Store the original filename
      url: imageUrl,
      uploadDate: new Date()
    });
    
    await newImage.save();
    console.log('✅ Sponsor image saved to database:', newImage);

    return res.json({
      message: "Image uploaded successfully!",
      imageUrl: imageUrl,
      image: newImage
    });
  } catch (error) {
    console.error('❌ Error uploading sponsor image:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Team image upload route
router.post('/upload-team', upload.single('image'), async (req, res) => {
  try {
    const { teamId, guardianId } = req.body;

    if (!teamId || !guardianId) {
      return res.status(400).json({ error: "teamId and guardianId are required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Verify the user is the manager of this team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.managerId?.toString() !== guardianId) {
      return res.status(403).json({ error: "You are not the manager of this team" });
    }

    const imageUrl = `/uploads/teams/${req.file.filename}`;

    return res.json({
      message: "Image uploaded successfully!",
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading team image:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;