import express from "express";
import Team from "../models/teams";
import {
  create_team,
  get_all_teams,
  get_team_by_id,
} from "../services/team_service";

const router = express.Router();

router.get("/", get_all_teams);

router.get("/:id", get_team_by_id);

router.patch("/:id", async (req, res) => {
  const { player } = req.body;

  if (!player) {
    return res.status(400).json({ error: "player data missing" });
  }

  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "team not found" });
    }

    if (team.players == null) {
      team.players = [];
    }

    team.players.push(player);

    const savedTeam = await team.save();
    return res.json(savedTeam);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
});

router.post("/", create_team);

export default router;
