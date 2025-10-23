import express from "express";
import Teenager from "../models/teenagers";

const router = express.Router();

router.get("/", (_req, res) => {
  Teenager.find({}).then((result) => {
    res.json(result);
  });
});

router.get("/:id", (req, res) => {
  return Teenager.findById(req.params.id).then((teenager) => {
    return res.json(teenager);
  });
});

router.post("/", (req, res) => {
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
});

export default router;
