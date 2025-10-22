import express from "express";

const router = express.Router();

router.get("/", (_req, res) => {
  res.send("getting teams...");
});

router.post("/", (_req, res) => {
  res.send("saving a team");
});

export default router;
