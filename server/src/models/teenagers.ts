import mongoose from "../database";
import bcrypt from "bcryptjs";
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
    // Ensure password is never sent in API responses
    delete (returnedObject as any).password;
    // delete returnedObject._id; // come back to this
    // delete returnedObject.__v;
  },
});

// Hash password before saving if it has been modified
teenagerSchema.pre("save", async function (next) {
  const doc = this as any;
  if (!doc.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    doc.password = await bcrypt.hash(doc.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

export default mongoose.model("Teenager", teenagerSchema);
