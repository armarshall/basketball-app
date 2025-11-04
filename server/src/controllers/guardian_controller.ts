import Guardian from "../models/guardians";
import { Request, Response } from "express";
import { validatePassword } from "../services/log_in_service";

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

export const get_guardian_by_email = async (req: Request, res: Response) => {
  return Guardian.findOne({ email: req.params.email }).then((guardian) => {
    return res.json(guardian);
  });
};

export const check_guardian_hash = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const guardian = await Guardian.findOne({ email: email });

  if (!guardian) return res.json({ success: false, error: "no guardian" });

  const isValidPassword = await validatePassword(
    password,
    guardian.password as string // because yelling at me that String instead of string
  );
  if (isValidPassword) {
    const user = {
      id: guardian._id,
      email: guardian.email,
      name: guardian.name,
      childId: guardian.childId,
    };
    return res.json({ success: true, user: user });
  } else {
    return res.json({ success: false });
  }
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
