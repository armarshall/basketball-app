import { Router } from "express";
import {
  add_game_event_by_id,
  delete_game_event_by_id,
  get_game_events_by_id,
} from "../controllers/game_event_controller";

const router = Router();

router.get("/:id", get_game_events_by_id);
router.post("/:id", add_game_event_by_id);
router.delete("/:id", delete_game_event_by_id);

export default router;
