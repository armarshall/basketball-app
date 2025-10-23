import express from "express";
import Child from "../models/children";

const router = express.Router();

router.get("/", (_req, res) => {
  Child.find({}).then((result) => {
    res.json(result);
  });
});

router.get("/:id", (req, res) => {
  return Child.findById(req.params.id).then((child) => {
    return res.json(child);
  });
});

router.post("/", (req, res) => {
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
});

export default router;
