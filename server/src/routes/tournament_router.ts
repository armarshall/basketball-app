import express from "express";

import {
  create_tournament,
  get_all_tounaments,
  get_tournament_by_id,
} from "../services/tournament_service";

const router = express.Router();

router.get("/", get_all_tounaments);

router.get("/:id", get_tournament_by_id);

router.post("/", create_tournament);

export default router;
