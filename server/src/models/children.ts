import mongoose from "../database";
import { IChild } from "../types";

const childSchema = new mongoose.Schema<IChild>({
  id: { type: String },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  guardianId: { type: String, required: true }, // Children must have a guardian
  teamId: { type: String, required: false }, // Optional - for children assigned to teams
});

childSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id; // come back to this
    // delete returnedObject.__v;
  },
});

export default mongoose.model("Child", childSchema);
