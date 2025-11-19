import mongoose from "../database";
import { IChild } from "../types";

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

const childSchema = new mongoose.Schema<IChild>({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  guardianId: { type: String, required: true },
  teamId: { type: String, required: false },
  game_stats: { type: [gameStatsSchema], default: [] } // Add this line
});

export default mongoose.model<IChild>("Child", childSchema);