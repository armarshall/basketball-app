import { Router } from "express";
import {
  get_all_tournaments,
  get_tournament_by_id,
  create_tournament,
} from "../controllers/tournament_controller";
import { get_rounds_by_tournament_id } from "../controllers/round_controller";

const router = Router();

router.get("/", get_all_tournaments);
router.get("/:id", get_tournament_by_id);
router.post("/", create_tournament);

router.get("/rounds/:id", get_rounds_by_tournament_id);

export default router;
