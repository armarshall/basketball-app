import Child from "../models/children";
import { Request, Response } from "express";

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
