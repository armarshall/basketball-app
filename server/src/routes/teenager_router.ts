import express from "express";
import {
  create_teenager,
  get_all_teenagers,
  get_teenager_by_email,
  get_teenager_by_id,
  update_teenager_team,
  check_teenager_hash,
} from "../controllers/teenager_controller";

const router = express.Router();

router.get("/", get_all_teenagers);

router.get("/id/:id", get_teenager_by_id);

router.get("/email/:email", get_teenager_by_email);

router.patch("/:id", update_teenager_team);

router.post("/", create_teenager);

router.post("/check-hash", check_teenager_hash);

export default router;
