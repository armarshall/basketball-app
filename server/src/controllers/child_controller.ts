import Child from "../models/children";
import { Request, Response } from "express";

import { GameStats, Statline } from "../types";

export const get_all_children = async (_req: Request, res: Response) => {
  return Child.find({}).then((result) => {
    return res.json(result);
  });
};

export const get_child_by_id = async (req: Request, res: Response) => {
  return Child.findById(req.params.id).then((child) => {
    return res.json(child);
  });
};

export const create_child = (req: Request, res: Response) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({ error: "content missing" });
  }

  const child = new Child({
    name: body.name,
    dateOfBirth: new Date(body.dateOfBirth),
    guardianId: body.guardianId,
    teamId: body.teamId,
  });

  let error = child.validateSync();
  if (error) {
    return res.status(400).json(error);
  }

  return child.save().then((savedChild) => {
    return res.json(savedChild);
  });
};

export const update_child_team = async (req: Request, res: Response) => {
  const { teamId } = req.body ?? {};

  if (!teamId) {
    return res.status(400).json({ error: "teamId missing" });
  }

  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ error: "child not found" });
    }

    child.teamId = teamId;

    const savedChild = await child.save();
    return res.json(savedChild);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const get_child_stats = async (req: Request, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json({ error: "no id specified" });
  }

  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({ error: "child not found" });
    }

    // Fix: Check if game_stats exists
    return res.json(child.game_stats || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const add_child_stats = async (req: Request, res: Response) => {
  const { game_stats }: { game_stats: GameStats | undefined } = req.body ?? {};

  if (!req.params.id) {
    return res.status(400).json({ error: "no id specified" });
  }

  if (!game_stats) {
    return res.status(400).json({ error: "gameStats missing" });
  }

  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({ error: "child not found" });
    }

    // Fix: Initialize game_stats array if it doesn't exist
    if (!child.game_stats) {
      child.game_stats = [];
    }

    child.game_stats.push(game_stats);

    const saved_child = await child.save();
    return res.json(saved_child);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const update_child_stats = async (req: Request, res: Response) => {
  interface expected_body {
    game_stats: Statline | undefined;
    game_id: String | undefined;
  }

  console.log(req.body);

  const { game_stats, game_id }: expected_body = req.body ?? {};

  if (!req.params.id) {
    return res.status(400).json({ error: "no id specified" });
  }

  if (!game_stats || Object.keys(game_stats).length === 0) {
    return res.status(400).json({ error: "game_stats missing :(" });
  }

  if (!game_id) {
    return res.status(400).json({ error: "game_id missing :(" });
  }

  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(400).json({ error: "child not found" });
    }

    // Fix: Check if game_stats exists and initialize if needed
    if (!child.game_stats) {
      return res.status(400).json({ error: "no game stats found for this child" });
    }

    const index = child.game_stats.findIndex((e) => e.game_id === game_id);

    if (index === -1) {
      return res.status(400).json({ error: "couldn't find game to update" });
    }

    child.game_stats[index].statline = game_stats;
    child.markModified("game_stats");

    const saved_child = await child.save();
    return res.json(saved_child);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};