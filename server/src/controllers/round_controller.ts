import { Request, Response } from "express";
import Round from "../models/rounds";

export const get_all_rounds = async (_req: Request, res: Response) => {
  try {
    const rounds = await Round.find();
    return res.status(200).json(rounds);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const get_rounds_by_tournament_id = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const rounds = await Round.find({ tournament: id });
    if (!rounds) {
      return res.status(404).json({ message: "Rounds not found" });
    }
    return res.status(200).json(rounds);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const get_round_by_id = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const round = await Round.findById(id);
    if (!round) {
      return res.status(404).json({ message: "Round not found" });
    }
    return res.status(200).json(round);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
