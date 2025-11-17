// middleware/verifyManager.ts
import { Request, Response, NextFunction } from "express";
import Team from "../models/teams";
import Guardian from "../models/guardians";

export const verifyManager = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { teamId } = req.params;
    
    // Get guardianId from request body or query with better error handling
    let guardianId = req.body?.guardianId || req.query?.guardianId;

    console.log('VerifyManager called with:', { teamId, guardianId, body: req.body, query: req.query });

    if (!teamId || !guardianId) {
      console.log('Missing required fields in verifyManager:', { teamId, guardianId });
      res.status(400).json({ error: "teamId and guardianId are required" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      console.log('Team not found:', teamId);
      res.status(404).json({ error: "Team not found" });
      return;
    }

    const guardian = await Guardian.findById(guardianId);
    if (!guardian) {
      console.log('Guardian not found:', guardianId);
      res.status(404).json({ error: "Guardian not found" });
      return;
    }

    // Check if guardian is the manager of this team
    if (team.managerId?.toString() !== guardianId) {
      console.log('Manager verification FAILED');
      res.status(403).json({ 
        error: "You are not the manager of this team"
      });
      return;
    }

    console.log('Manager verification SUCCESS');
    next();
  } catch (err) {
    console.error('Error in verifyManager:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};