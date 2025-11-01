import express from "express";
import {
  create_team,
  get_all_teams,
  get_team_by_id,
  update_team_players,
  get_team_players,
} from "../controllers/team_controller";

const router = express.Router();

router.get("/", get_all_teams);

router.get("/:id", get_team_by_id);

router.get("/:id/players", get_team_players);

router.patch("/:id", update_team_players);

router.post("/", create_team);

export default router;
