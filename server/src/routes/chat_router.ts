import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/chat_controller";

const router = Router();

// Get all messages for a team
router.get("/:teamId/messages", getMessages);

// Send a message to a team chat
router.post("/:teamId/messages", sendMessage);

export default router;

