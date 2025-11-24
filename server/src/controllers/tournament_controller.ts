import Tournament from "../models/tournaments";
import Team from "../models/teams";

import { ITeam, ITournament } from "../types";
import { Request, Response } from "express";

export const generate_tournament = (
  teams: ITeam[],
  week_of: Date,
  is_teen_team: boolean
): ITournament => {
  const eligible_teams = teams.filter(
    (team) => team.is_teen_team === is_teen_team
  );

  console.log("number of eligible teams: ", eligible_teams.length);
  
  // Create tournament structure that matches your ITournament interface
  const tournament: ITournament = {
    start_date_time: week_of,
    is_teen_tournament: is_teen_team,
    round_ids: [] // ✅ This matches your interface (optional array)
  };

  return tournament;
};

export const generate_next_round = (): boolean => {
  console.log("generate_next_round called but needs implementation");
  return false;
};

// Get all tournaments
export const get_all_tournaments = async (_req: Request, res: Response) => {
  try {
    const tournaments = await Tournament.find({});
    return res.json(tournaments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get tournament by ID
export const get_tournament_by_id = async (req: Request, res: Response) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }
    return res.json(tournament);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Create tournament
export const create_tournament = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!body) {
      return res.status(400).json({ error: "content missing" });
    }

    const teams = await Team.find({});
    const tournament_data = generate_tournament(
      teams,
      new Date(body.week_of),
      body.is_teen_team
    );

    const tournament = new Tournament(tournament_data);
    const saved_tournament = await tournament.save();
    return res.json(saved_tournament);
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update tournament
export const update_tournament = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const tournament = await Tournament.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    return res.json(tournament);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete tournament
export const delete_tournament = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tournament = await Tournament.findByIdAndDelete(id);

    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    return res.json({ message: "Tournament deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};