import { Request, Response, NextFunction } from "express";
import Guardian from "../models/guardians";

/**
 * Middleware to check if the requesting user is an admin guardian
 * Expects guardianId in request body
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const guardianId = req.body.guardianId;

    if (!guardianId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const guardian = await Guardian.findById(guardianId);

    if (!guardian) {
      return res.status(401).json({ error: "Guardian not found" });
    }

    if (!guardian.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    // User is admin, proceed to next middleware/controller
    next();
  } catch (err) {
    console.error("Admin auth error:", err);
    return res.status(500).json({ error: "Authorization failed" });
  }
};
