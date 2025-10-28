import express from "express";
import {
  create_guardian,
  get_all_guardians,
  get_guardian_by_id,
} from "../services/guardian_service";

const router = express.Router();

router.get("/", get_all_guardians);

router.get("/:id", get_guardian_by_id);

router.post("/", create_guardian);

export default router;
