import mongoose from "../database";
import { IGuardian } from "../types";
import { hashPassword } from "../services/hashing";

const guardianSchema = new mongoose.Schema<IGuardian>({
  id: { type: String },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  childId: { type: String, required: false },
  isAdmin: { type: Boolean, default: false },
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
    doc.password = await hashPassword(doc.password);
    next();
  } catch (err) {
    next(err as any);
  }
});

export default mongoose.model("Guardian", guardianSchema);
