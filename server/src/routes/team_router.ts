import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  get_all_teams,
  join_team_as_player,
  add_player_to_team,
  remove_player_from_team,
  get_team_with_players,
  join_team_as_manager,
  leave_team_as_manager,
  get_team_by_id,
  get_team_by_name,
  create_team,
  get_team_players,
  get_teams_with_managers,
  get_guardian_team,
  get_team_settings,
  update_team_settings,
} from "../controllers/team_controller";
import { verifyManager } from "../middleware/verifyManager";

const router = Router();

// Configure multer for team image uploads
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

// Basic routes
router.get("/", get_all_teams);
router.get("/:id", get_team_by_id);
router.post("/", create_team);

// Test routes
router.get("/simple-test", (_req, res) => {
  res.json({ message: "Simple test works!" });
});

router.get("/version-check", (_req, res) => {
  res.json({
    message: "Version check works!",
    timestamp: new Date().toISOString(),
    hasJoinAsPlayer: true,
  });
});

// Player and Manager joining routes
router.post("/join-as-player", join_team_as_player);
router.post("/join-as-manager", join_team_as_manager);
router.post("/leave-as-manager", leave_team_as_manager);

// Player management routes
router.get("/:teamId/players", get_team_players);
router.get("/with-managers", get_teams_with_managers);
router.get("/guardian/:guardianId", get_guardian_team);
router.get("/by-name/:name", get_team_by_name);

// Manager-only routes (protected by verifyManager middleware)
router.post("/:teamId/add-player", verifyManager, add_player_to_team);
router.post("/:teamId/remove-player", verifyManager, remove_player_from_team);
router.patch("/:teamId/add-player", add_player_to_team);
router.patch("/:teamId/remove-player/:playerId", remove_player_from_team);
router.get("/:teamId/manage", get_team_with_players);
router.get("/:teamId/settings", verifyManager, get_team_settings);
router.patch("/:teamId/settings", verifyManager, update_team_settings);
router.put("/:teamId/settings", verifyManager, update_team_settings); // PUT alias for settings update

// Team image upload route
router.post("/:teamId/upload-image", upload.single('teamImage'), async (req, res) => {
  try {
    const { teamId } = req.params;
    const { guardianId } = req.body;

    if (!guardianId) {
      return res.status(400).json({ error: "guardianId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Import Team model
    const Team = (await import("../models/teams")).default;

    // Verify the user is the manager of this team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.managerId?.toString() !== guardianId) {
      return res.status(403).json({ error: "You are not the manager of this team" });
    }

    // Save the image URL to the team settings
    const imageUrl = `/uploads/teams/${req.file.filename}`;
    
    if (!team.teamSettings) {
      team.teamSettings = {};
    }
    
    team.teamSettings.teamImage = imageUrl;
    await team.save();

    return res.json({
      message: "Team image uploaded successfully!",
      imageUrl: imageUrl,
      team: team
    });
  } catch (error) {
    console.error('Error uploading team image:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
