import mongoose from "../database";
import { Document, Schema } from "mongoose";

export interface IRules {
  content: string;
  updatedAt: Date;
}

export type RulesDocument = Document & IRules;

const rulesSchema = new Schema<RulesDocument>(
  {
    content: { type: String, required: true, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { minimize: false }
);

rulesSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<RulesDocument>("Rules", rulesSchema);
