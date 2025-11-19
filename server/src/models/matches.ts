import mongoose from "../database";
import { IMatch } from "../types";

const matchSchema = new mongoose.Schema<IMatch>({
  id: { type: String, required: false },
  team1_id: { type: String, required: true },
  team2_id: { type: String, required: true },
  start_date_time: { type: Date, required: false },
  team1_score: { type: Number, required: false },
  team2_score: { type: Number, required: false },
  winner_id: { type: String, required: false },
  round_id: { type: String, required: true },
});

matchSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
  },
});

const Match = mongoose.model<IMatch>("Match", matchSchema);

export default Match;
