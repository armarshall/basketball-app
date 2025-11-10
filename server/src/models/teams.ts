// models/teams.ts
import mongoose from "../database";
import { ITeam } from "../types";

const teamSchema = new mongoose.Schema<ITeam>({
  id: { type: String },
  name: { type: String, required: true },
  players: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teenager',
    validate: {
      validator: function(v: any) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Player must be a valid ObjectId'
    }
  }],
  is_teen_team: { type: Boolean, required: true },
  managerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Guardian',
    default: null 
  }
});

teamSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
  },
});

export default mongoose.model("Team", teamSchema);