import Match from "../models/matches";
import { Request, Response } from "express";
import { GameEvent } from "../types";

export const get_game_events_by_id = async (req: Request, res: Response) => {
  return Match.findById(req.params.id).then((match) => {
    return res.json(match?.game_events);
  });
};

export const add_game_event_by_id = async (req: Request, res: Response) => {
  interface expected_body {
    game_event: GameEvent | undefined;
  }

  const { game_event }: expected_body = req.body ?? {};

  if (!req.params.id) {
    return res.status(400).json({ error: "no id specified" });
  }

  if (!req.body) {
    return res.status(400).json({ error: "no body" });
  }

  if (!game_event) {
    return res.status(400).json({ error: "no game event to add" });
  }

  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(400).json({ error: "match not found" });
    }

    if (!match.game_events) {
      match.game_events = [];
    }

    match.game_events.push(game_event);
    match.markModified("game_events");

    const saved_match = await match.save();
    return res.json(saved_match);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const delete_game_event_by_id = async (req: Request, res: Response) => {
  interface expected_body {
    game_event_to_delete: number | undefined;
  }

  const { game_event_to_delete }: expected_body = req.body ?? {};
  console.log(req.body);

  if (!req.params.id) {
    return res.status(400).json({ error: "no id specified" });
  }

  if (!req.body) {
    return res.status(400).json({ error: "no body" });
  }

  if (game_event_to_delete == null) {
    return res.status(400).json({ error: "no game event to delete id" });
  }

  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(400).json({ error: "match not found" });
    }

    if (!(match.game_events.length > game_event_to_delete!)) {
      return res.status(400).json({ error: "invalid game index" });
    }

    match.game_events.splice(game_event_to_delete!, 1);
    match.markModified("game_events");

    const saved_match = await match.save();
    return res.json(saved_match);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};
