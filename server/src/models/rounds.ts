import mongoose from "../database";
import { IRound } from "../types";

const roundSchema = new mongoose.Schema<IRound>({
  id: { type: String, required: false },
  match_ids: { type: [String], required: false },
  tournament_id: { type: String, required: true },
});

roundSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
  },
});

const Round = mongoose.model<IRound>("Round", roundSchema);

export default Round;
