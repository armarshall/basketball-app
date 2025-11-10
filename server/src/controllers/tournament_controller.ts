import { Request, Response } from "express";
import Tournament from "../models/tournaments";

// TEMPORARY: Simple tournament controller to fix compilation
export const get_all_tournaments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tournaments = await Tournament.find({});
    res.json(tournaments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const get_tournament_by_id = async (req: Request, res: Response): Promise<void> => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      res.status(404).json({ error: "Tournament not found" });
      return;
    }
    res.json(tournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const create_tournament = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(501).json({ message: "Tournament creation disabled temporarily" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};