import express from "express";
import Team from "../models/teams";

const router = express.Router();

router.get("/", (_req, res) => {
  // res.send("getting teams...");

  Team.find({}).then((result) => {
    res.json(result);
  });
});

router.get("/:id", (req, res) => {
  return Team.findById(req.params.id).then((team) => {
    return res.json(team);
  });
});

router.post("/", (req, res) => {
  // res.send("saving a team");
  const body = req.body;

  if (!body) {
    return res.status(400).json({ error: "content missing" });
  }

  const team = new Team({
    name: body.name,
    players: body.players,
    is_teen_team: body.is_teen_team,
  });

  let error = team.validateSync();
  if (error) {
    return res.status(400).json(error);
  }

  return team.save().then((savedTeam) => {
    return res.json(savedTeam);
  });
});

export default router;
