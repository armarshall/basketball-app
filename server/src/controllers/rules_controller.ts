import { Request, Response } from "express";
import Rules, { RulesDocument } from "../models/rules";

export const get_rules = async (_req: Request, res: Response) => {
  try {
    let doc = (await Rules.findOne({})) as RulesDocument | null;
    if (!doc) {
      doc = (await Rules.create({})) as RulesDocument;
    }
    return res.json({
      id: String(doc._id),
      content: doc.content,
      updatedAt: doc.updatedAt,
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

    let doc = (await Rules.findOne({})) as RulesDocument | null;
    if (!doc) {
      doc = new Rules({ content }) as RulesDocument;
    } else {
      doc.content = content;
    }
    await doc.save();
    return res.json({
      id: String(doc._id),
      content: doc.content,
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    console.error("Failed to update rules", err);
    return res.status(500).json({ error: "internal server error" });
  }
};
