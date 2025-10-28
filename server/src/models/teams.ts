import mongoose from "../database";
import { ITeam } from "../types";

const teamSchema = new mongoose.Schema<ITeam>({
  id: { type: String },
  name: { type: String, required: true },
  players: [{ type: String }],
  is_teen_team: { type: Boolean, required: true },
});

teamSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // come back to this
  },
});

export default mongoose.model("Team", teamSchema);
