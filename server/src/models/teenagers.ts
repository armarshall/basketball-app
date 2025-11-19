import mongoose from "../database";
import { ITeenager } from "../types";
import { hashPassword } from "../services/hashing";

// Define the game stats sub-schema
const gameStatsSchema = new mongoose.Schema({
  game_id: { type: String, required: true },
  statline: {
    points: { type: Number, default: 0 },
    rebounds: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    steals: { type: Number, default: 0 },
    blocks: { type: Number, default: 0 },
    turnovers: { type: Number, default: 0 }
  },
  date: { type: Date, default: Date.now }
});

const teenagerSchema = new mongoose.Schema<ITeenager>({
  id: { type: String },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  teamId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: false 
  },
  game_stats: { type: [gameStatsSchema], default: [] } // Add this line
});

teenagerSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete (returnedObject as any).password;
  },
});

// Hash password before saving
teenagerSchema.pre("save", async function (next) {
  const doc = this as any;
  if (!doc.isModified("password")) {
    return next();
  }
  try {
    doc.password = await hashPassword(doc.password);
    next();
  } catch (err) {
    next(err as any);
  }
});

export default mongoose.model("Teenager", teenagerSchema);