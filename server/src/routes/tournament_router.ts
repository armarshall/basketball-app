import express from "express";
import Tournament from "../models/tournaments";
import Team from "../models/teams";
import { generate_tournament } from "../services/tournament_service";

const router = express.Router();

router.get("/", (_req, res) => {
  // res.send("getting teams...");

  return Tournament.find({}).then((result) => {
    return res.json(result);
  });
});

router.get("/:id", (req, res) => {
  return Tournament.findById(req.params.id).then((team) => {
    return res.json(team);
  });
});

router.post("/", (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({ error: "content missing" });
  }

  return Team.find({}).then((teams) => {
    console.log(body);
    const tournament_data = generate_tournament(teams, new Date(body.start_date_time), body.is_teen_team);
    
    const tournament = new Tournament(tournament_data);
    let error = tournament.validateSync();
    if (error) {
      return res.status(400).json(error);
    }

    return tournament.save().then((saved_tournament) => {
      return res.json(saved_tournament);
    });
  });
});

export default router;
