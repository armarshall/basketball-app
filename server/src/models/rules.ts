import mongoose from "../database";
import { Schema } from "mongoose";

const rulesSchema: Schema = new Schema(
  {
    content: { type: String, required: true, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { minimize: false }
);

rulesSchema.pre("save", function (next) {
  (this as any).updatedAt = new Date();
  next();
});

export default mongoose.model("Rules", rulesSchema);
