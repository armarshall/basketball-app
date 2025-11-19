import { Request, Response } from "express";
import Message from "../models/messages";
import Guardian from "../models/guardians";
import Teenager from "../models/teenagers";
import mongoose from "mongoose";

// Send a message to a team chat
export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { userId, userType, content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: "Message content is required" });
      return;
    }

    const normalizedIncomingType = userType?.toLowerCase();

    // Get sender name based on user type
    let senderName = "Unknown";
    if (normalizedIncomingType === "guardian") {
      let guardian = await Guardian.findById(userId);

      if (!guardian) {
        guardian = await Guardian.findOne({ id: userId });
      }

      if (!guardian) {
        guardian = await Guardian.findOne({ managedTeamId: teamId });
      }

      if (guardian) {
        senderName = guardian.name;
      }
    } else if (
      normalizedIncomingType === "teenager" ||
      normalizedIncomingType === "teen"
    ) {
      const teenager = await Teenager.findById(userId);
      if (teenager) {
        senderName = teenager.name;
      }
    }

    // Normalize userType to match the enum in the Message schema
    let normalizedUserType = userType;
    if (normalizedIncomingType === "guardian") {
      normalizedUserType = "Guardian";
    } else if (
      normalizedIncomingType === "teenager" ||
      normalizedIncomingType === "teen"
    ) {
      normalizedUserType = "Teenager";
    }

    // Create and save the message
    const message = new Message({
      teamId: new mongoose.Types.ObjectId(teamId),
      senderId: userId,
      senderType: normalizedUserType,
      content: content.trim(),
      senderName: senderName,
      timestamp: new Date(),
    });

    await message.save();

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (err) {
    console.error("Error in sendMessage:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all messages for a team
export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const messages = await Message.find({ teamId })
      .sort({ timestamp: 1 })
      .limit(limit);

    res.json(messages);
  } catch (err) {
    console.error("Error in getMessages:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
