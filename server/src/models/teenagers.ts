import mongoose from "../database";
import { ITeenager } from "../types";

const teenagerSchema = new mongoose.Schema<ITeenager>({
  id: { type: String },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  teamId: { type: String, required: false }, // Optional - for teenagers assigned to teams
});

teenagerSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id; // come back to this
    // delete returnedObject.__v;
  },
});

export default mongoose.model("Teenager", teenagerSchema);
