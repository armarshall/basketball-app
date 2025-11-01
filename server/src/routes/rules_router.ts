import express from "express";
import { get_rules, update_rules } from "../controllers/rules_controller";

const router = express.Router();

router.get("/", get_rules);

router.put("/", update_rules);

export default router;
