import express from "express";
import { get_rules, update_rules } from "../controllers/rules_controller";
import { requireAdmin } from "../middleware/adminAuth";

const router = express.Router();

router.get("/", get_rules);

router.put("/", requireAdmin, update_rules);

export default router;
