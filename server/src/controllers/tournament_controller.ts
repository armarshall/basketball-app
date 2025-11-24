import Tournament from "../models/tournaments";
import Team from "../models/teams";
import Match from "../models/matches";
import Round from "../models/rounds";
import { ObjectId } from "mongodb";
//import { get_rounds_by_tournament_id } from "../services/round_service";

import { ITeam } from "../types";
import { Request, Response } from "express";

export function shuffle<T>(arr: T[]) {
  arr.sort(() => Math.random() - 0.5);
}

/**
 * Gets the next Saturday of the given date
 * date:    date to find the next Saturday for
 * return:  1 Saturday from date
 */
function getNextSaturday(date: Date): Date {
  // 0 = Sunday, 6 = Saturday
  const currentDay = date.getDay();

  // If today is Saturday, schedule for next Saturday
  const daysUntilSaturday = currentDay != 6 ? 6 - currentDay : 7;

  // Return next saturday's date
  return new Date(date.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000);
}

export const generate_tournament = async (
  teams: ITeam[],
  week_of: Date,
  is_teen_tournament: boolean,
) => {
  const eligible_teams = teams.filter(
    (team) => team.is_teen_team === is_teen_tournament,
  );

  console.log("number of eligible teams: ", eligible_teams.length);
  let match_time: Date = getNextSaturday(week_of);

  shuffle(eligible_teams);

  let tournament = {
    _id: new ObjectId(),
    start_date_time: week_of,
    is_teen_tournament: is_teen_tournament,
    round_ids: [],
  };

  let first_round = {
    _id: new ObjectId(),
    tournament_id: tournament._id.toString(),
    matches: [],
  };

  const newTournament = await Tournament.create(tournament);
  const newRound = await Round.create(first_round);

  const match_ids: string[] = [];

  while (eligible_teams.length > 1) {
    let team1 = eligible_teams.pop();
    let team2 = eligible_teams.pop();

    if (!team1 || !team2) {
      break;
    }

    // ✅ FIX: Use team_ids array instead of team1_id/team2_id
    const match = {
      _id: new ObjectId(),
      team_ids: [team1._id?.toString() || team1.id || "", team2._id?.toString() || team2.id || ""],
      start_date_time: match_time,
      scores: [0, 0],
      winner_id: "",
      round_id: (newRound._id as ObjectId).toString(),
    };

    const newMatch = await Match.create(match);
    match_ids.push(newMatch._id.toString());
    console.log("Created match:", newMatch);

    match_time = getNextSaturday(match_time);
  }

  // Update round with match IDs
  newRound.matches = match_ids;
  await Promise.all([newTournament.save(), newRound.save()]);

  // Update tournament with round_id
  newTournament.round_ids = [(newRound._id as ObjectId).toString()];
  await newTournament.save();

  // Return the created tournament
  return newTournament;
};

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
    const saved_tournament = await generate_tournament(
      teams,
      new Date(body.week_of),
      body.is_teen_team,
    );

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