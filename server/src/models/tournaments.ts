import mongoose from "../database";
import { ITournament } from "../types";

const tournamentSchema = new mongoose.Schema<ITournament>({
  is_teen_tournament: { type: Boolean, required: true },
  start_date_time: Date,
  rounds: [
    {
      matches: [
        {
          team_ids: [{ type: String }],
          start_date_time: Date,
          scores: [{ type: Number}],
          winner_id: String,
        },
      ],
    },
  ],
});

tournamentSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id; // come back to this
    // delete returnedObject.__v;
  },
});

export default mongoose.model("Tournament", tournamentSchema);
