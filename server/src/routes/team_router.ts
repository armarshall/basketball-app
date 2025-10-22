import express from "express";
import Team from "../models/teams";

const router = express.Router();

router.get("/", (_req, _res) => {
  // res.send("getting teams...");
  // Team.
});

router.get("/:id", (req, res) => {
  return Team.findById(req.params.id).then((team) => {
    return res.json(team);
  });
});

router.post("/", (req, res) => {
  // res.send("saving a team");
  const body = req.body;

  if (!body.content) {
    return res.status(400).json({ error: "content missing" });
  }

  const team = new Team({
    name: body.name,
    players: body.players,
  });

  return team.save().then((savedTeam) => {
    return res.json(savedTeam);
  });
});

export default router;
