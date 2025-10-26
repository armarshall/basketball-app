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

router.patch("/:id", async (req, res) => {
  const { teamId } = req.body;

  if (!teamId) {
    return res.status(400).json({ error: "teamId missing" });
  }

  try {
    const teenager = await Teenager.findById(req.params.id)
    if (!teenager) {
      return res.status(404).json({ error: "teenager not found" });
    }
    
    // update the teenager's teamId
    teenager.teamId = teamId;

    const savedTeenager = await teenager.save();
    return res.json(savedTeenager);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
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
