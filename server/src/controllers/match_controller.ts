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

    const team1 = await Team.findById(match.team1_id);
    const team2 = await Team.findById(match.team2_id);

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
    const { team1_id, team2_id, start_date_time, round_id } = req.body;
    const match = new Match({ team1_id, team2_id, start_date_time, round_id });
    await match.save();
    return res.status(201).json(match);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const update_match = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { team1_id, team2_id, start_date_time } = req.body;
    const match = await Match.findByIdAndUpdate(
      id,
      { team1_id, team2_id, start_date_time },
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
