import mongoose from "../database";
import { GameEvent, IMatch } from "../types";

const matchSchema = new mongoose.Schema<IMatch>({
  team_ids: { type: [String], required: true }, // ✅ FIX: Use 'team_ids' instead of 'team1_id'
  start_date_time: { type: Date, required: false },
  scores: { type: [Number], required: false },
  winner_id: { type: String, required: false },
  round_id: { type: String, required: true },
  game_events: Array<GameEvent>,
});

matchSchema.set("toJSON", {
  transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Match = mongoose.model<IMatch>("Match", matchSchema);

export default Match;
