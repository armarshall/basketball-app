import mongoose from "../database";
import { ITeam } from "../types";

const teamSettingsSchema = new mongoose.Schema({
  jerseyColor: { type: String, default: "#000000" },
  primaryColor: { type: String, default: "#1e40af" },
  secondaryColor: { type: String, default: "#dc2626" },
  practiceDays: { type: [String], default: [] },
  practiceTime: { type: String, default: "18:00" },
  maxPlayers: { type: Number, default: 12 },
  seasonStart: { type: Date, default: () => new Date() },
  seasonEnd: { type: Date, default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
  contactEmail: { type: String, default: "" },
  contactPhone: { type: String, default: "" },
  teamImage: { type: String, default: "" }
});

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
  },
  teamSettings: { 
    type: teamSettingsSchema, 
    default: () => ({}) 
  }
});

teamSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
  },
});

export default mongoose.model("Team", teamSchema);