import { Router } from "express";
import {
  get_all_teams,
  join_team_as_player,
  add_player_to_team,
  remove_player_from_team,
  get_team_with_players,
  join_team_as_manager,
  leave_team_as_manager,
  get_team_by_id,
  create_team,
  get_team_players,
  get_teams_with_managers,
  get_guardian_team,
  get_team_settings,
  update_team_settings,
} from "../controllers/team_controller";
import { verifyManager } from "../MiddleWare/verifyManager";

const router = Router();

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

// Manager-only routes (protected by verifyManager middleware)
router.post("/:teamId/add-player", verifyManager, add_player_to_team);
router.post("/:teamId/remove-player", verifyManager, remove_player_from_team);
router.patch("/:teamId/add-player", add_player_to_team);
router.patch("/:teamId/remove-player/:playerId", remove_player_from_team);
router.get("/:teamId/manage", get_team_with_players);
router.get("/:teamId/settings", verifyManager, get_team_settings);
router.patch("/:teamId/settings", verifyManager, update_team_settings);

export default router;
