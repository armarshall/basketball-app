import Router from "express";
import {
  get_all_rounds,
  get_round_by_id,
} from "../controllers/round_controller";
import { get_matches_by_round_id } from "../controllers/match_controller";

const router = Router();

router.get("/", get_all_rounds);
router.get("/:id", get_round_by_id);

router.get("/:id/matches", get_matches_by_round_id);

export default router;
