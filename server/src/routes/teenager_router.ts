import express from "express";
import {
  create_teenager,
  get_all_teenagers,
  get_teenager_by_email,
  get_teenager_by_id,
  update_teenager_team,
  check_teenager_hash,
  get_teenager_stats,
  add_teenager_stats,
  update_teenager_stats,
} from "../controllers/teenager_controller";

const router = express.Router();

router.get("/", get_all_teenagers);

router.get("/id/:id", get_teenager_by_id);

router.get("/email/:email", get_teenager_by_email);

router.patch("/:id", update_teenager_team);

router.post("/", create_teenager);

router.post("/check-hash", check_teenager_hash);

router.get("/stats/:id", get_teenager_stats);

router.post("/stats/:id", add_teenager_stats);

router.patch("/stats/:id", update_teenager_stats);

export default router;
