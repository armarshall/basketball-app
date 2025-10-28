import express from "express";
import {
  create_teenager,
  get_all_teenagers,
  get_teenager_by_id,
  update_teenager_team,
} from "../services/teenager_service";

const router = express.Router();

router.get("/", get_all_teenagers);

router.get("/:id", get_teenager_by_id);

router.patch("/:id", update_teenager_team);

router.post("/", create_teenager);

export default router;
