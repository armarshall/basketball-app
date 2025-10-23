import express from "express";
import Guardian from "../models/guardians";

const router = express.Router();

router.get("/", (_req, res) => {
  Guardian.find({}).then((result) => {
    res.json(result);
  });
});

router.get("/:id", (req, res) => {
  return Guardian.findById(req.params.id).then((guardian) => {
    return res.json(guardian);
  });
});

router.post("/", (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({ error: "content missing" });
  }

  const guardian = new Guardian({
    name: body.name,
    dateOfBirth: new Date(body.dateOfBirth),
    email: body.email,
    password: body.password,
  });

  let error = guardian.validateSync();
  if (error) {
    return res.status(400).json(error);
  }

  return guardian.save().then((savedGuardian) => {
    return res.json(savedGuardian);
  });
});

export default router;
