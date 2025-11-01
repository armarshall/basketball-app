import { Request, Response } from "express";
import Rules from "../models/rules";

export const get_rules = async (_req: Request, res: Response) => {
  try {
    let doc = await Rules.findOne({});
    if (!doc) {
      doc = await Rules.create({});
    }
    return res.json({
      id: (doc as any)._id.toString(),
      content: (doc as any).content,
      updatedAt: (doc as any).updatedAt,
    });
  } catch (err) {
    console.error("Failed to fetch rules", err);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const update_rules = async (req: Request, res: Response) => {
  try {
    const { content } = req.body || {};
    if (typeof content !== "string") {
      return res.status(400).json({ error: "content must be a string" });
    }

    let doc = await Rules.findOne({});
    if (!doc) {
      doc = new Rules({ content });
    } else {
      (doc as any).content = content;
    }
    await doc.save();
    return res.json({
      id: (doc as any)._id.toString(),
      content: (doc as any).content,
      updatedAt: (doc as any).updatedAt,
    });
  } catch (err) {
    console.error("Failed to update rules", err);
    return res.status(500).json({ error: "internal server error" });
  }
};
