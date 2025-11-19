import { Router } from "express";
import {
  get_all_matches,
  get_match_by_id,
  create_match,
  update_match,
  delete_match,
  get_teams_by_match_id,
} from "../controllers/match_controller";

const router = Router();

router.get("/", get_all_matches);
router.get("/:id", get_match_by_id);
router.post("/", create_match);
router.patch("/:id", update_match);
router.delete("/:id", delete_match);
router.get("/:id/teams", get_teams_by_match_id);

export default router;
