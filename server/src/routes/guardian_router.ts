import express from "express";
import {
  create_guardian,
  get_all_guardians,
  get_guardian_by_id,
  get_guardian_by_email,
  check_guardian_hash,
} from "../controllers/guardian_controller";

const router = express.Router();

router.get("/", get_all_guardians);

router.get("/id/:id", get_guardian_by_id);

router.get("/email/:email", get_guardian_by_email);

router.post("/", create_guardian);

router.post("/check-hash", check_guardian_hash);

export default router;
