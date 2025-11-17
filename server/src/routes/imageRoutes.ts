import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Team from '../models/teams';

const router = Router();

// Configure multer for file uploads
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

// Team image upload route
router.post('/upload-team', upload.single('image'), async (req, res) => {
  try {
    const { teamId, guardianId } = req.body;

    if (!teamId || !guardianId) {
      res.status(400).json({ error: "teamId and guardianId are required" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    // Verify the user is the manager of this team
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    if (team.managerId?.toString() !== guardianId) {
      res.status(403).json({ error: "You are not the manager of this team" });
      return;
    }

    const imageUrl = `/uploads/teams/${req.file.filename}`;

    res.json({
      message: "Image uploaded successfully!",
      imageUrl: imageUrl
    });
    return; // Explicit return
  } catch (error) {
    console.error('Error uploading team image:', error);
    res.status(500).json({ error: "Internal server error" });
    return; // Explicit return
  }
});

export default router;