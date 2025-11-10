import Teenager from "../models/teenagers";
import { Request, Response } from "express";
import { validatePassword } from "../services/hashing";

import { GameStats, Statline } from "../types";

export const get_all_teenagers = async (_req: Request, res: Response) => {
  return Teenager.find({}).then((result) => {
    return res.json(result);
  });
};

export const get_teenager_by_id = async (req: Request, res: Response) => {
  return Teenager.findById(req.params.id).then((teenager) => {
    return res.json(teenager);
  });
};

export const get_teenager_by_email = async (req: Request, res: Response) => {
  return Teenager.findOne({ email: req.params.email }).then((teenager) => {
    return res.json(teenager);
  });
};

export const create_teenager = (req: Request, res: Response) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({ error: "content missing" });
  }

  const teenager = new Teenager({
    name: body.name,
    dateOfBirth: new Date(body.dateOfBirth),
    email: body.email,
    password: body.password,
    teamId: body.teamId,
  });

  let error = teenager.validateSync();
  if (error) {
    return res.status(400).json(error);
  }

  return teenager.save().then((savedTeenager) => {
    return res.json(savedTeenager);
  });
};

export const check_teenager_hash = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const teenager = await Teenager.findOne({ email: email });

  if (!teenager) return res.json({ success: false });

  const isValidPassword = await validatePassword(
    password,
    teenager.password as string,
  );
  if (isValidPassword) {
    const user = {
      id: teenager._id,
      email: teenager.email,
      name: teenager.name,
    };
    return res.json({ success: true, user: user });
  } else {
    return res.json({ success: false });
  }
};

export const update_teenager_team = async (req: Request, res: Response) => {
  const { teamId } = req.body ?? {};

  if (!teamId) {
    return res.status(400).json({ error: "teamId missing" });
  }

  try {
    const teenager = await Teenager.findById(req.params.id);
    if (!teenager) {
      return res.status(404).json({ error: "teenager not found" });
    }

    teenager.teamId = teamId;

    const savedTeenager = await teenager.save();
    return res.json(savedTeenager);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const get_teenager_stats = async (req: Request, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json({ error: "no id specified" });
  }

  try {
    const teenager = await Teenager.findById(req.params.id);

    if (!teenager) {
      return res.status(404).json({ error: "teen not found" });
    }

    // Fix: Check if game_stats exists
    return res.json(teenager.game_stats || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const add_teenager_stats = async (req: Request, res: Response) => {
  const { game_stats }: { game_stats: GameStats | undefined } = req.body ?? {};

  if (!req.params.id) {
    return res.status(400).json({ error: "no id specified" });
  }

  if (!game_stats) {
    return res.status(400).json({ error: "gameStats missing" });
  }

  try {
    const teenager = await Teenager.findById(req.params.id);

    if (!teenager) {
      return res.status(404).json({ error: "teenager not found" });
    }

    // Fix: Initialize game_stats array if it doesn't exist
    if (!teenager.game_stats) {
      teenager.game_stats = [];
    }

    teenager.game_stats.push(game_stats);

    const savedTeenager = await teenager.save();
    return res.json(savedTeenager);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const update_teenager_stats = async (req: Request, res: Response) => {
  interface expected_body {
    game_stats: Statline | undefined;
    game_id: String | undefined;
  }

  const { game_stats, game_id }: expected_body = req.body ?? {};

  if (!req.params.id) {
    return res.status(400).json({ error: "no id specified" });
  }

  if (!game_stats) {
    return res.status(400).json({ error: "game_stats missing :(" });
  }

  if (!game_id) {
    return res.status(400).json({ error: "game_id missing :(" });
  }

  try {
    const teenager = await Teenager.findById(req.params.id);

    if (!teenager) {
      return res.status(400).json({ error: "teenager not found" });
    }

    // Fix: Check if game_stats exists and initialize if needed
    if (!teenager.game_stats) {
      return res.status(400).json({ error: "no game stats found for this teenager" });
    }

    const index = teenager.game_stats.findIndex((e) => e.game_id === game_id);

    if (index === -1) {
      return res.status(400).json({ error: "couldn't find game to update" });
    }

    teenager.game_stats[index].statline = game_stats;
    teenager.markModified("game_stats");

    const savedTeenager = await teenager.save();
    return res.json(savedTeenager);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};