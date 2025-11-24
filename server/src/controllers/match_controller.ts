import { Request, Response } from "express";
import Match from "../models/matches";
import Team from "../models/teams";

export const get_all_matches = async (_req: Request, res: Response) => {
  try {
    const matches = await Match.find();
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const get_matches_by_round_id = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const matches = await Match.find({ round_id: id });
    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const get_match_by_id = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    return res.status(200).json(match);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const get_teams_by_match_id = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const match = await Match.findById(id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // ✅ FIX: Use team_ids array instead of team1_id/team2_id
    const team1 = await Team.findById(match.team_ids[0]);
    const team2 = await Team.findById(match.team_ids[1]);

    if (!team1 || !team2) {
      return res.status(404).json({ message: "Team not found" });
    }

    const teams = {
      team1,
      team2,
    };

    return res.status(200).json(teams);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const create_match = async (req: Request, res: Response) => {
  try {
    const { team_ids, start_date_time, scores, winner_id, round_id } = req.body;
    
    // ✅ FIX: Use properties that match IMatch interface
    const match = new Match({ 
      team_ids: team_ids || [],
      start_date_time: start_date_time ? new Date(start_date_time) : undefined,
      scores: scores || [],
      winner_id: winner_id || "",
      round_id: round_id
    });
    
    await match.save();
    return res.status(201).json(match);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const update_match = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { team_ids, start_date_time, scores, winner_id, round_id } = req.body;
    
    // ✅ FIX: Use properties that match IMatch interface
    const match = await Match.findByIdAndUpdate(
      id,
      { 
        team_ids, 
        start_date_time: start_date_time ? new Date(start_date_time) : undefined, 
        scores, 
        winner_id, 
        round_id 
      },
      { new: true },
    );
    
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    return res.status(200).json(match);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const delete_match = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const match = await Match.findByIdAndDelete(id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};