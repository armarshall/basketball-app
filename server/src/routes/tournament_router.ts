import { Router } from "express";
import {
  get_all_tournaments,
  get_tournament_by_id,
  create_tournament
} from "../controllers/tournament_controller";

const router = Router(); // ✅ Now Router is used

// Tournament routes
router.get("/", get_all_tournaments);
router.get("/:id", get_tournament_by_id);
router.post("/", create_tournament);

export default router; // ✅ Now router is exported