import mongoose from "../database";
import bcrypt from "bcryptjs";
import { IGuardian } from "../types";

const guardianSchema = new mongoose.Schema<IGuardian>({
  id: { type: String },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  childId: { type: String, required: false },
});

guardianSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // Ensure password is never sent in API responses
    delete (returnedObject as any).password;
    // delete returnedObject._id; // come back to this
    // delete returnedObject.__v;
  },
});

// Hash password before saving if it has been modified
guardianSchema.pre("save", async function (next) {
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

export default mongoose.model("Guardian", guardianSchema);
