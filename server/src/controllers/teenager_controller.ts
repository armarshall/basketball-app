import Teenager from "../models/teenagers";
import { Request, Response } from "express";

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


