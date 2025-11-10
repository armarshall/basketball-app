// middleware/verifyManager.ts
import { Request, Response, NextFunction } from "express";
import Team from "../models/teams";
import Guardian from "../models/guardians";

export const verifyManager = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { teamId } = req.params;
    
    // Get guardianId from request body or query
    let guardianId = req.body.guardianId || req.query.guardianId;

    if (!teamId || !guardianId) {
      res.status(400).json({ error: "teamId and guardianId are required" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    const guardian = await Guardian.findById(guardianId);
    if (!guardian) {
      res.status(404).json({ error: "Guardian not found" });
      return;
    }

    // Check if guardian is the manager of this team
    if (team.managerId?.toString() !== guardianId) {
      res.status(403).json({ 
        error: "You are not the manager of this team"
      });
      return;
    }

    next();
  } catch (err) {
    console.error('Error in verifyManager:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};