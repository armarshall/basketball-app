// middleware/verifyTeamMember.ts
import { Request, Response, NextFunction } from "express";
import Team from "../models/teams";
import Guardian from "../models/guardians";
import Teenager from "../models/teenagers";

export const verifyTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { teamId } = req.params;

    // Get userId and userType from request body or query
    const userId = req.body?.userId || req.query.userId;
    const userType = (req.body?.userType || req.query.userType) as string;

    if (!teamId || !userId || !userType) {
      res
        .status(400)
        .json({ error: "teamId, userId, and userType are required" });
      return;
    }

    // Normalize userType to handle case variations (lowercase for comparison)
    const userTypeLower = userType.toLowerCase();

    // Verify team exists
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    let isMember = false;

    if (userTypeLower === "guardian") {
      const guardian = await Guardian.findById(userId);
      if (!guardian) {
        res.status(404).json({ error: "Guardian not found" });
        return;
      }

      // Check if guardian is the manager of this team
      if (guardian.managedTeamId?.toString() === teamId) {
        isMember = true;
      }
    } else if (userTypeLower === "teenager" || userTypeLower === "teen") {
      const teenager = await Teenager.findById(userId);
      if (!teenager) {
        res.status(404).json({ error: "Teenager not found" });
        return;
      }

      // Check if teenager is on this team
      if (teenager.teamId?.toString() === teamId) {
        isMember = true;
      }
    } else {
      res
        .status(400)
        .json({ error: "Invalid userType. Must be 'Guardian' or 'Teenager'" });
      return;
    }

    if (!isMember) {
      res.status(403).json({
        error: "You are not a member of this team",
      });
      return;
    }

    next();
  } catch (err) {
    console.error("Error in verifyTeamMember:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
