import mongoose from "../database";
import { Player, PlayerPosition } from "../types";

const playerSchema = new mongoose.Schema<Player>({
  name: { type: String, required: true },
  position: { 
    type: String, 
    required: true,
    enum: Object.values(PlayerPosition)
  },
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team',
    default: null 
  },
  jerseyNumber: { 
    type: Number, 
    required: true,
    min: 0,
    max: 99
  },
  height: { type: String },
  weight: { type: Number }
}, {
  timestamps: true // This will automatically add createdAt and updatedAt
});

playerSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export default mongoose.model<Player>("Player", playerSchema);