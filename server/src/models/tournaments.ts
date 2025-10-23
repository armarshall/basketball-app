import mongoose from "mongoose";
import { ITournament } from "../types";

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI as string;

console.log("connecting to db: ", url);
mongoose
  .connect(url)
  .then((_result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const tournamentSchema = new mongoose.Schema<ITournament>({
  is_teen_tournament: { type: Boolean, required: true },
  rounds: [
    {
      matches: [
        {
          team_ids: [{ type: String }],
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
