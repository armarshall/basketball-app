import Guardian from "../models/guardians";
import { Request, Response } from "express";

export const get_all_guardians = async (_req: Request, res: Response) => {
  return Guardian.find({}).then((result) => {
    return res.json(result);
  });
};

export const get_guardian_by_id = async (req: Request, res: Response) => {
  return Guardian.findById(req.params.id).then((guardian) => {
    return res.json(guardian);
  });
};

export const create_guardian = (req: Request, res: Response) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({ error: "content missing" });
  }

  const guardian = new Guardian({
    name: body.name,
    dateOfBirth: new Date(body.dateOfBirth),
    email: body.email,
    password: body.password,
    childId: body.childId,
  });

  let error = guardian.validateSync();
  if (error) {
    return res.status(400).json(error);
  }

  return guardian.save().then((savedGuardian) => {
    return res.json(savedGuardian);
  });
};


