import Team from "../models/teams";
import { Request, Response } from "express";

export const get_all_teams = async (_req: Request, res: Response) => {
  return Team.find({}).then((result) => {
    return res.json(result);
  });
};

export const get_team_by_id = async (req: Request, res: Response) => {
  return Team.findById(req.params.id).then((team) => {
    return res.json(team);
  });
};

export const create_team = (req: Request, res: Response) => {
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
    console.log(error);
    return res.status(400).json(error);
  }

  return team.save().then((savedTeam) => {
    console.log("created team: ", savedTeam);
    return res.json(savedTeam);
  });
};

export const update_team_players = async (req: Request, res: Response) => {
  const player = req.body;

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
};
